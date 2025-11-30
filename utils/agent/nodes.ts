import Database from "better-sqlite3";
import {
  chartGeneratorLlm,
  generalChatLlm,
  queryAnswerSummarizerLlm,
  queryClarifierLlm,
  queryGeneratorLlm,
  queryOrchestratorLlm,
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
  CHART_GENERATOR_PROMPT,
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
import { typedUi } from "@langchain/langgraph-sdk/react-ui/server";
import type ComponentMap from "./ui";
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
  return {
    messages: [new AIMessage({content:res.message,response_metadata: {
          
          tags: ["final_response"],
        },})],
    routeDecision:ROUTES.END
  };
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
    const prompt = await QUERY_PLANNER_PROMPT.format({
      tool_registry:JSON.stringify(TOOL_REGISTRY)
    })
    const res = await queryPlannerLlm.invoke([
      new SystemMessage(prompt),
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

  const res = await queryOrchestratorLlm.invoke(
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



export const generateChartData = withFaultTolerance(async (state:GraphState)=>{

  const prompt = await CHART_GENERATOR_PROMPT.format({
    queryResult:JSON.stringify(state.queryResult.slice(0,5)),
    chatHistory:JSON.stringify(state.messages.slice(-3))
  })
  const res = await chartGeneratorLlm.invoke([new SystemMessage(prompt), ...state.messages]);
  return {
    ui:{
      config:res,
      data:state.queryResult
    },
    feedback:"Chart generate successfully. now summerize data",
    routeDecision:ROUTES.ORCHESTRATOR
  }
})
