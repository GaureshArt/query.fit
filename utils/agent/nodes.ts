import Database from "better-sqlite3";
import {
  chartGeneratorLlm,
  intentEvaluatorLlm,
  queryAnswerSummarizerLlm,
  queryGeneratorLlm,
  queryPlannerLlm,
  queryPlannerLlmSchema,
} from "./models";
import { GraphState } from "./state";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import path from "path";
import os from "os";
import {
  CHART_GENERATOR_PROMPT,
  INTENT_EVALUATOR_SYSTEM_PROMPT,
  QUERY_ANSWER_SUMMARIZER_SYSTEM_PROMPT,
  QUERY_GENERATOR_SYSTEM_PROMPT,
  QUERY_PLANNER_PROMPT,
} from "./prompts";
import { Command, Graph, interrupt } from "@langchain/langgraph";

export const intentEvaluator = async (state: GraphState) => {
  const res = await intentEvaluatorLlm.invoke([
    ...INTENT_EVALUATOR_SYSTEM_PROMPT,
    ...state.messages,
  ]);
  if (res.isQueryReadOnly) {
    return {
      routeDecision: "checkSchema",
    };
  }
  return {
    routeDecision: "complexQueryApproval",
  };
};

export const checkSchema = async (state: GraphState) => {
  if (state.schema) {
    return {
      routeDecision: "generateQuery",
    };
  }

  return {
    routeDecision: "generateSchema",
  };
};

export const generateSchema = async (state: GraphState) => {
  if (!state.dbId) {
    return {
      error: "Database path is missing. Cannot generate schema.",
    };
  }
  try {
    const dbId = state.dbId;
    const finalDbPath = path.join(os.tmpdir(), `queryfit_${dbId}.db`);
    const db = new Database(finalDbPath, { readonly: true });
    const schemaQuery = "SELECT sql FROM sqlite_master WHERE type='table';";
    const tables: { sql: string }[] = db.prepare(schemaQuery).all() as {
      sql: string;
    }[];
    db.close();
    // console.log(`tables: ${tables}`);
    // console.log(typeof tables[0]);
    const schemaString = tables.map((t) => t.sql).join("\n");

    return {
      schema: schemaString,
    };
  } catch (err) {
    if (err instanceof Error) {
      return { error: `Failed to read database: ${err.message}` };
    }
    return { error: "An unknown error occurred while generating schema." };
  }
};

export const generateQuery = async (state: GraphState) => {
  const res = await queryGeneratorLlm.invoke([
    ...QUERY_GENERATOR_SYSTEM_PROMPT,
    new HumanMessage(`the schema of database is ${state.schema}`),
    ...state.messages,
  ]);
  if (res.isIncomplete) {
    return {
      messages: [new AIMessage(res.reasone)],
      routeDecision: "__end__",
    };
  }
  return {
    sqlQuery: res.query,
    routeDecision: "executeQuery",
  };
};

export const executeQuery = async (state: GraphState) => {
  if (!state.sqlQuery) {
    return { error: "Sql query is missing" };
  }

  if (!state.dbId) {
    return { error: "Database ID is missing" };
  }

  const dbId = state.dbId;
  const finalDbPath = path.join(os.tmpdir(), `queryfit_${dbId}.db`);

  const db = new Database(finalDbPath);
  const sql = state.sqlQuery;

  let queryResult;

  try {
    if (sql.trim().toUpperCase().startsWith("SELECT")) {
      queryResult = db.prepare(sql).all();
    } else {
      queryResult = db.prepare(sql).run();
    }
  } catch (err: any) {
    db.close();
    return { error: `SQL Execution Failed: ${err.message}` };
  }

  db.close();
  return {
    queryResult: queryResult,
  };
};

export const summarizeOutput = async (state: GraphState) => {
  const res = await queryAnswerSummarizerLlm.invoke([
    ...QUERY_ANSWER_SUMMARIZER_SYSTEM_PROMPT,
    ...state.messages,
    new AIMessage(`This is query result: ${JSON.stringify(state.queryResult)}`),
  ]);
  return {
    messages: [new AIMessage(res.output)],
  };
};
export const complexQueryApproval = async (state: GraphState) => {
  const approved = interrupt(
    "Warning: This query appears to modify or delete data. Are you sure you want to proceed?"
  );
  if (approved.shouldContinue) {
    return new Command({
      update: {
        routeDecision: "checkSchema",
      },
      goto: "checkSchema",
    });
  }
  return new Command({
    update: {
      messages: [
        new AIMessage(
          "The operation was not approved and has been stopped. You can ask a new question."
        ),
      ],
      routeDecision: "__end__",
    },
    goto: "__end__",
  });
};

export const generateChartData = async (state: GraphState) => {
  try {
    const { messages, queryResult } = state;

    if (!queryResult || queryResult.length === 0) {
      return { error: "No data available to generate a chart." };
    }
    const question = messages.at(-1)?.content as string;
    if (!question) {
      return { error: "No user question found in history." };
    }
    const dataSample = queryResult.slice(0, 10);
    const formattedPrompt = await CHART_GENERATOR_PROMPT.format({
      data: JSON.stringify(dataSample),
      request: question,
    });
    const res = await chartGeneratorLlm.invoke(formattedPrompt);
    const content = res.content as string;
    let chartSpec: object;
    try {
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```|({[\s\S]*})/);
      if (!jsonMatch) {
        throw new Error("No valid JSON object found in the LLM response.");
      }
      const jsonString = jsonMatch[1] ?? jsonMatch[0];
      chartSpec = JSON.parse(jsonString);
    } catch (parseError: any) {
      console.error("Failed to parse chart spec:", content, parseError);
      return {
        error: `The AI returned an invalid chart format. ${parseError.message}`,
      };
    }
    return {
      chartSpec: chartSpec,
    };
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { error: `Failed to generate chart: ${err.message}` };
    }
    return { error: "An unknown error occurred while generating the chart." };
  }
};




export const queryPlanner = async (state:GraphState)=>{
  const lastMessage = state.messages.at(-1) as HumanMessage
  const res = await queryPlannerLlm.invoke([...QUERY_PLANNER_PROMPT,new HumanMessage(lastMessage?.content)]) 
  return {
    queryPlan:res,
    routeDecision:"orchastrator"
  }
}

