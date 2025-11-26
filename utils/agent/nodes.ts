import Database from "better-sqlite3";
import {
  generalChatLlm,
  queryAnswerSummarizerLlm,
  queryClarifierLlm,
  queryGeneratorLlm,
  queryOrchestratorLlmMistral,
  queryPlannerLlm,
  validatorLlm,
} from "./models";
import { GraphState, ROUTES } from "./state";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import path from "path";
import os from "os";
import {
  GENERAL_CHAT_PROMPT,
  QUERY_ANSWER_SUMMARIZER_SYSTEM_PROMPT,
  QUERY_CLARIFIER_PROMPT,
  QUERY_GENERATOR_SYSTEM_PROMPT,
  QUERY_ORCHESTRATOR_PROMPT,
  QUERY_PLANNER_PROMPT,
  VALIDATOR_PROMPT,
} from "./prompts";
import {
  Command,
  interrupt,
  LangGraphRunnableConfig,
} from "@langchain/langgraph";
import { TOOL_REGISTRY } from "./toolsInfo";
import { withFaultTolerance } from "./wrapper";

export const generateSchema = withFaultTolerance(async (state: GraphState) => {
  if (state.schema) {
    return {
      feedback: "Schema is already generated.",
      routeDecision: ROUTES.ORCHESTRATOR,
    };
  }

  if (!state.dbId) {
    throw new Error("Database ID is missing. Cannot generate schema.");
  }

  const sanitizedId = state.dbId.replace(/[^a-zA-Z0-9_-]/g, "");
  const dbPath = path.join(os.tmpdir(), `queryfit_${sanitizedId}.db`);

  try {
    const db = new Database(dbPath, { readonly: true, fileMustExist: true });

    try {
      const schemaQuery = "SELECT sql FROM sqlite_master WHERE type='table';";
      const tables = db.prepare(schemaQuery).all() as { sql: string }[];
      const schemaString = tables.map((t) => t.sql).join("\n");

      return {
        schema: schemaString,
        feedback: "Schema generated successfully.",
        routeDecision: ROUTES.ORCHESTRATOR,
      };
    } finally {
      if (db.open) db.close();
    }
  } catch (err) {
    throw err;
  }
});

export const generateQuery = withFaultTolerance(async (state: GraphState) => {
  const prompt = await QUERY_GENERATOR_SYSTEM_PROMPT.format({
    query: state.messages.at(-1)?.content,
    feedback: state.feedback,
    schema: state.schema,
  });

  const res = await queryGeneratorLlm.invoke([
    new SystemMessage(prompt),
    ...state.messages,
  ]);

  if (res.isIncomplete) {
    return {
      feedback: res.reason,
      routeDecision: ROUTES.QUERY_CLARIFIER,
    };
  }

  return {
    feedback: "",
    sqlQuery: res.query,
    routeDecision: ROUTES.VALIDATOR,
  };
});

export const queryClarifier = withFaultTolerance(async (state: GraphState) => {
  const prompt = await QUERY_CLARIFIER_PROMPT.format({
    schema: state.schema,
    feedback: state.feedback,
    userMessage: state.messages.at(-1)?.content,
  });

  const res = await queryClarifierLlm.invoke([
    new SystemMessage(prompt),
    ...state.messages,
  ]);

  const interruptor = interrupt(res.message);

  return new Command({
    update: {
      messages: [new HumanMessage(interruptor)],
      feedback: interruptor,
    },
    goto: ROUTES.GENERATE_QUERY,
  });
});

export const executeQuery = withFaultTolerance(async (state: GraphState) => {
  const sql = state.sqlQuery;
  const rawDbId = state.dbId;

  if (!sql) throw new Error("SQL query is missing from state.");
  if (!rawDbId) throw new Error("Database ID is missing from state.");

  const sanitizedDbId = rawDbId.replace(/[^a-zA-Z0-9_-]/g, "");
  const dbPath = path.join(os.tmpdir(), `queryfit_${sanitizedDbId}.db`);
  const isReadOnlyIntent = /^\s*(SELECT|WITH|PRAGMA|EXPLAIN)\b/i.test(sql);

  try {
    const db = new Database(dbPath, {
      readonly: isReadOnlyIntent,
      fileMustExist: true,
    });

    try {
      let result;
      if (isReadOnlyIntent) {
        result = db.prepare(sql).all();
      } else {
        result = db.prepare(sql).run();
      }

      return {
        feedback: "Query executed successfully.",
        queryResult: result,
        retryCount: 0,
        routeDecision: ROUTES.ORCHESTRATOR,
      };
    } finally {
      if (db.open) db.close();
    }
  } catch (err) {
    // Re-throwing allows the wrapper to standardise the error message
    throw err;
  }
});

export const complexQueryApproval = 
  async (state: GraphState) => {
    const approved = interrupt({value:"The generated query may manipulate data. Do you want to proceed?",id:"ComplexQueryApproval"});

    if (approved.shouldContinue) {
      return new Command({
        update: {
          feedback: "User approved query",
          routeDecision: ROUTES.ORCHESTRATOR,
        },
        goto: ROUTES.ORCHESTRATOR,
      });
    }

    return new Command({
      update: {
        feedback: "User disapproved manipulation query. End the query by giving proper feed back to the user i.e. You disapprove the query you can ask new query.",
        routeDecision: ROUTES.ORCHESTRATOR,
      },
      goto: ROUTES.ORCHESTRATOR,
    });
  }


export const queryPlanner = withFaultTolerance(
  async (state: GraphState, config?: LangGraphRunnableConfig) => {
    const res = await queryPlannerLlm.invoke([
      new SystemMessage(QUERY_PLANNER_PROMPT),
      ...state.messages,
    ]);

    return {
      queryPlan: res,
      feedback: "Start executing steps now",
      routeDecision: ROUTES.ORCHESTRATOR,
    };
  }
);

export const validator = withFaultTolerance(async (state: GraphState) => {
  if (!state.sqlQuery) {
    throw new Error("Cannot validate. SQL query is missing.");
  }

  const prompt = await VALIDATOR_PROMPT.format({
    sqlQuery: state.sqlQuery,
    schema: state.schema,
    userQuery: state.messages.at(-1)?.content,
  });

  const res = await validatorLlm.invoke([
    new SystemMessage(prompt),
    ...state.messages,
  ]);

  return {
    feedback: res.feedback,
    routeDecision: res.routeDecision,
  };
});

export const orchestrator = withFaultTolerance(async (state: GraphState) => {
  const queryPlan = state.queryPlan;
  const currentStepIndex = state.currentStepIndex;
  const retryCount = state.retryCount;

  const prompt = await QUERY_ORCHESTRATOR_PROMPT.format({
    queryPlan: JSON.stringify(queryPlan),
    currentStepIndex: currentStepIndex.toString(),
    retryCount: retryCount.toString(),
    feedback: state.feedback,
    userQuery: state.messages.at(-1)?.content ?? "",
    toolList: JSON.stringify(TOOL_REGISTRY),
    needsReplanning: state.needsReplanning,
    validatorScore: state.validatorScore?.toString() ?? "0",
  });

  const res = await queryOrchestratorLlmMistral.invoke(
    [new SystemMessage(prompt), ...state.messages],
    { recursionLimit: 10 }
  );

  return {
    feedback: res.feedback,
    needsReplanning: res.needsReplanning,
    retryCount: res.retryCount,
    currentStepIndex: res.currentStepIndex,
    routeDecision: res.routeDecision,
  };
});

export const summarizeOutput = withFaultTolerance(async (state: GraphState) => {
  const rawResult = state.queryResult;
  const LIMIT = 8;
  const isTruncated = Array.isArray(rawResult) && rawResult.length > LIMIT;

  const displayData = Array.isArray(rawResult)
    ? rawResult.slice(0, LIMIT)
    : rawResult;

  const prompt = await QUERY_ANSWER_SUMMARIZER_SYSTEM_PROMPT.format({
    queryRes: JSON.stringify(displayData),
    schema: state.schema ?? "No schema provided",
    is_truncated: isTruncated ? "true" : "false",
  });

  const res = await queryAnswerSummarizerLlm.invoke([
    new SystemMessage(prompt),
    ...state.messages,
  ]);

  return {
    messages: [
      new AIMessage({
        content: res.content,
        response_metadata: {
          ...res.response_metadata,
          tags: ["final_response"],
        },
      }),
    ],
    routeDecision: ROUTES.END,
    feedback: "",
    queryPlan: undefined,
    currentStepIndex: 0,
  };
});

export const generalChat = withFaultTolerance(async (state: GraphState) => {
  const prompt = await GENERAL_CHAT_PROMPT.format({
    schema: state.schema,
    feedback: state.feedback,
  });

  const res = await generalChatLlm.invoke([
    new SystemMessage(prompt),
    ...state.messages,
  ]);

  return {
    routeDecision: ROUTES.END,
    messages: [
      new AIMessage({
        content: res.content,
        response_metadata: {
          ...res.response_metadata,
          tags: ["final_response"],
        },
      }),
    ],
    feedback: "",
    queryPlan: undefined,
    currentStepIndex: 0,
  };
});

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
