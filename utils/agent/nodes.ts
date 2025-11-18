import Database from "better-sqlite3";
import {
  chartGeneratorLlm,
  generalChatLlm,
  
  queryAnswerSummarizerLlm,
  queryClarifierLlm,
  queryGeneratorLlm,
  queryOrchestratorLlm,
  queryPlannerLlm,
  queryPlannerLlmSchema,
  validatorLlm,
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
  GENERAL_CHAT_PROMPT,
  QUERY_ANSWER_SUMMARIZER_SYSTEM_PROMPT,
  QUERY_CLARIFIER_PROMPT,
  QUERY_GENERATOR_SYSTEM_PROMPT,
  QUERY_ORCHESTRATOR_PROMPT,
  QUERY_PLANNER_PROMPT,
  VALIDATOR_PROMPT,
} from "./prompts";
import { Command,  interrupt } from "@langchain/langgraph";
import { TOOL_REGISTRY } from "./toolsInfo";



export const generateSchema = async (
  state: GraphState
): Promise<Partial<GraphState>> => {
  if (state.schema) {
    return {
      feedback:"schema is already generated",
      routeDecision: "orchestrator",
    };
  }
  if (!state.dbId) {
    return {
      lastError: "Database path is missing. Cannot generate schema.",
      routeDecision: "orchestrator",
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

    const schemaString = tables.map((t) => t.sql).join("\n");

    return {
      schema: schemaString,
      feedback:"Schema generated correctly",
      routeDecision: "orchestrator",
    };
  } catch (err) {
    if (err instanceof Error) {
      return { feedback: `Failed to read database: ${err.message}`,routeDecision:"orchestrator",retryCount:state.retryCount+1 };
    }
    return { feedback: "An unknown error occurred while generating schema." ,routeDecision:"orchestrator",retryCount:state.retryCount+1 };
  }
};
export const generateQuery = async (
  state: GraphState
): Promise<Partial<GraphState>> => {
  
  const prompt = await QUERY_GENERATOR_SYSTEM_PROMPT.format({
    query:state.messages.at(-1)?.content,
    feedback:state.feedback,
    schema:state.schema
  })
  const res = await queryGeneratorLlm.invoke([
    new SystemMessage(prompt),
    ...state.messages,
  ]);
  if (res.isIncomplete) {
    return {
      feedback: res.reason,
      routeDecision: "queryClarifier",
    };
  }
  return {
    feedback:"",
    sqlQuery: res.query,
    routeDecision: "validator",
  };
};
export const queryClarifier = async (state:GraphState)=>{
  const prompt = await QUERY_CLARIFIER_PROMPT.format({
    schema:state.schema,
    feedback:state.feedback,
    userMessage:state.messages.at(-1)?.content
  })

  const res = await queryClarifierLlm.invoke([new SystemMessage(prompt),...state.messages]);
  const interruptor = interrupt(res.message);
  return new Command({update:{
    messages:[new HumanMessage(interruptor)],
    feedback:interruptor
  },goto:"generateQuery"})
}
export const executeQuery = async (
  state: GraphState
): Promise<Partial<GraphState>> => {
  const sql = state.sqlQuery;

  if (!sql) {
    return {
      feedback: "SQL query is missing.",
      routeDecision: "orchestrator",
      retryCount:state.retryCount+1,
    };
  }

  if (!state.dbId) {
    return {
      feedback: "Database ID is missing.",
      routeDecision: "orchestrator",
      retryCount:state.retryCount+1,
    };
  }

  const dbPath = path.join(os.tmpdir(), `queryfit_${state.dbId}.db`);

  let db;
  try {
    db = new Database(dbPath);
  } catch (err) {
    return {
      feedback: `Could not open database: ${String(err)}`,
      routeDecision: "orchestrator",
      retryCount:state.retryCount+1,
    };
  }

  let result;
  try {
    const isReadOnly = /^\s*(SELECT|WITH|PRAGMA|EXPLAIN)\b/i.test(sql);

    if (isReadOnly) {
      result = db.prepare(sql).all();
    } else {
      result = db.prepare(sql).run();
    }
  } catch (err) {
    db.close();
    return {
      feedback: `SQL Execution failed: ${
        err instanceof Error ? err.message : String(err)
      }`,
      retryCount:state.retryCount+1,
      routeDecision: "orchestrator",
    };
  }

  db.close();

  return {
    feedback:"Query Executed correcty and result is get stored in queryResult",
    queryResult: result,
    routeDecision: "orchestrator",
  };
};


export const summarizeOutput = async (
  state: GraphState
): Promise<Partial<GraphState>> => {
  const prompt = await QUERY_ANSWER_SUMMARIZER_SYSTEM_PROMPT.format({
    queryRes: JSON.stringify(Array.isArray(state.queryResult)?state.queryResult.slice(0,8):state.queryResult),
  });
  const res = await queryAnswerSummarizerLlm.invoke([
    new SystemMessage(prompt),
    ...state.messages,
  ]);
  return {
    messages: [new AIMessage(res.output)],
    answeredQuery: true,
    routeDecision: "__end__",
  };
};
export const complexQueryApproval = async (state: GraphState) => {
  const approved = interrupt(
    "Given query may manipulate given below data. You do want to proceed?"
  );
  if (approved.shouldContinue) {
    return new Command({
      update: {
        feedback: "User approve query",
        routeDecision: "orchestrator",
      },
      goto: "orchestrator",
    });
  }
  return new Command({
    update: {
      feedback: "User dis-approve query",
      routeDecision: "orchestrator",
    },
    goto: "orchestrator",
  });
};
export const queryPlanner = async (
  state: GraphState
): Promise<Partial<GraphState>> => {
  const lastMessage = state.messages.at(-1) as HumanMessage;
  const prompt = await QUERY_PLANNER_PROMPT.format({
    userMessage:lastMessage.content,
    schema:state.schema,
    toolList:JSON.stringify(TOOL_REGISTRY)
  })
  const res = await queryPlannerLlm.invoke([
    new SystemMessage(prompt),
    ...state.messages
  ]);
  return {
    queryPlan: res,
    routeDecision: "orchestrator",
  };
};
export const generalChat = async (
  state: GraphState
): Promise<Partial<GraphState>> => {
  const prompt = await GENERAL_CHAT_PROMPT.format({
    schema:state.schema,
    feedback:state.feedback
  })
  const res = await generalChatLlm.invoke([new SystemMessage(prompt),...state.messages])


  return {
    routeDecision:"__end__",
    messages:[new AIMessage(res.content)]
  };
};
export const validator = async (state:GraphState): Promise<Partial<GraphState>> =>{
    if (!state.sqlQuery) {
    return {
      feedback: "Cannot validate. SQL query is missing.",
      routeDecision: "orchestrator",
      retryCount:state.retryCount+1
    }
  }
  const prompt = await VALIDATOR_PROMPT.format({
    sqlQuery:state.sqlQuery,
    schema:state.schema,
    userQuery:state.messages.at(-1)?.content
  })
  const res = await validatorLlm.invoke([new SystemMessage(prompt),...state.messages])

  return {
    feedback:res.feedback,
    routeDecision:res.routeDecision
  }
}
export const orchestrator = async (
  state: GraphState
): Promise<Partial<GraphState>> => {
  const queryPlan = state.queryPlan;
  const currentStepIndex = state.currentStepIndex;
  const retryCount = state.retryCount;

  const prompt = await QUERY_ORCHESTRATOR_PROMPT.format({
    queryPlan: JSON.stringify(queryPlan),
    currentStepIndex: currentStepIndex.toString(),
    retryCount: retryCount.toString(),
    feedback:state.feedback,
    userQuery:state.messages.at(-1)?.content ?? "",
    toolList:JSON.stringify(TOOL_REGISTRY),
    needsReplanning:state.needsReplanning
  });
  const res = await queryOrchestratorLlm.invoke([new SystemMessage(prompt),...state.messages]);

  return {
    feedback:res.feedback,
    needsReplanning:res.needsReplanning,
    retryCount:res.retryCount,
    currentStepIndex:res.currentStepIndex,
    routeDecision: res.routeDecision,
  };
};




// export const generateChartData = async (state: GraphState) => {
//   try {
//     const { messages, queryResult } = state;

//     if (!queryResult || queryResult.length === 0) {
//       return { error: "No data available to generate a chart." };
//     }
//     const question = messages.at(-1)?.content as string;
//     if (!question) {
//       return { error: "No user question found in history." };
//     }
//     const dataSample = queryResult.slice(0, 10);
//     const formattedPrompt = await CHART_GENERATOR_PROMPT.format({
//       data: JSON.stringify(dataSample),
//       request: question,
//     });
//     const res = await chartGeneratorLlm.invoke(formattedPrompt);
//     const content = res.content as string;
//     let chartSpec: object;
//     try {
//       const jsonMatch = content.match(/```json\n([\s\S]*?)\n```|({[\s\S]*})/);
//       if (!jsonMatch) {
//         throw new Error("No valid JSON object found in the LLM response.");
//       }
//       const jsonString = jsonMatch[1] ?? jsonMatch[0];
//       chartSpec = JSON.parse(jsonString);
//     } catch (parseError: any) {
//       console.error("Failed to parse chart spec:", content, parseError);
//       return {
//         error: `The AI returned an invalid chart format. ${parseError.message}`,
//       };
//     }
//     return {
//       chartSpec: chartSpec,
//     };
//   } catch (err: unknown) {
//     if (err instanceof Error) {
//       return { error: `Failed to generate chart: ${err.message}` };
//     }
//     return { error: "An unknown error occurred while generating the chart." };
//   }
// };