import Database from "better-sqlite3";
import mysql from "mysql2/promise";
import {
  chartGeneratorLlm,
  generalChatLlm,
  queryAnswerSummarizerLlm,
  queryClarifierLlm,
  queryGeneratorLlm,
  queryOrchestratorLlm,
  queryPlannerLlm,
  
} from "./models";
import { GraphState, ROUTES } from "./state";
import { AIMessage, AIMessageChunk, SystemMessage } from "@langchain/core/messages";
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
import { getLiveCredentials, validateAndFixQuery } from "./utils";
import { Pool } from "pg";

export const generateSchema = withFaultTolerance(async (state: GraphState) => {
  if (state.schema) {
    return {
      feedback: "Schema is already generated (Cached).",
      routeDecision: ROUTES.ORCHESTRATOR,
    };
  }

  const { dbId: rawDbId, dbType } = state;

  if (!rawDbId) {
    throw new Error("Database ID is missing. Cannot generate schema.");
  }

  if (rawDbId.startsWith("live_")) {
    console.log("line 53");
    const liveCreds = await getLiveCredentials(rawDbId);
    console.log("line 55: ", liveCreds?.connectionString);
    if (!liveCreds || !liveCreds.connectionString) {
      throw new Error("Live Database connection not found.");
    }

    const type = liveCreds.dbType?.toLowerCase() || "postgresql";
    let schemaString = "";

    if (["postgresql", "postgres", "supabase", "neon"].includes(type)) {
      const pool = new Pool({
        connectionString: liveCreds.connectionString,
        ssl: { rejectUnauthorized: false },
        allowExitOnIdle: true,
        max: 1,
        idleTimeoutMillis: 3000,
        connectionTimeoutMillis: 10000,
      });

      try {
        const client = await pool.connect();
        try {
          const res = await client.query(`
            SELECT table_name, 
                   string_agg(column_name || ' ' || data_type, ', ') as columns
            FROM information_schema.columns
            WHERE table_schema = 'public'
            GROUP BY table_name;
          `);

          schemaString = res.rows
            .map((row) => `TABLE ${row.table_name} (${row.columns});`)
            .join("\n");
        } finally {
          client.release();
        }
      } finally {
        await pool.end();
      }
    } else if (["mysql", "mariadb"].includes(type)) {
      const connection = await mysql.createConnection(
        liveCreds.connectionString
      );
      try {
        const [rows] = await connection.execute(`
          SELECT TABLE_NAME as table_name,
                 GROUP_CONCAT(CONCAT(COLUMN_NAME, ' ', COLUMN_TYPE) SEPARATOR ', ') as columns
          FROM information_schema.columns
          WHERE TABLE_SCHEMA = DATABASE()
          GROUP BY TABLE_NAME;
        `);
        schemaString = JSON.stringify(rows);
        // // @ts-ignore (MySQL2 types can be tricky with array destructuring)
        // schemaString = rows.map((row: any) =>
        //   `TABLE ${row.table_name} (${row.columns});`
        // ).join("\n");
      } finally {
        await connection.end();
      }
    }

    return {
      dbType: liveCreds.dbType,
      schema: schemaString,
      feedback: "Live Schema generated successfully. Go to the next step",
      routeDecision: ROUTES.ORCHESTRATOR,
    };
  }

  const sanitizedId = rawDbId.replace(/[^a-zA-Z0-9_-]/g, "");
  const dbPath = path.join(os.tmpdir(), `queryfit_${sanitizedId}.db`);

  try {
    const db = new Database(dbPath, { readonly: true, fileMustExist: true });

    try {
      const schemaQuery = "SELECT sql FROM sqlite_master WHERE type='table';";
      const tables = db.prepare(schemaQuery).all() as { sql: string }[];

      const schemaString = tables
        .map((t) => t.sql)
        .filter((sql) => sql !== null)
        .join("\n");

      return {
        schema: schemaString,
        feedback: "Local Schema generated successfully.",
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
    dbType:state.dbType
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
    messages: [
      new AIMessage({
        content: res.message,
        response_metadata: {
          tags: ["final_response"],
        },
      }),
    ],
    routeDecision: ROUTES.END,
  };
});

export const executeQuery = withFaultTolerance(async (state: GraphState) => {
  const { sqlQuery: sql, dbId: rawDbId, dbType } = state;

  if (!sql) throw new Error("SQL query is missing from state.");
  if (!rawDbId) throw new Error("Database ID is missing from state.");

  const isReadOnlyIntent = /^\s*(SELECT|WITH|PRAGMA|EXPLAIN|SHOW)\b/i.test(sql);


  if (rawDbId.startsWith("live_")) {
    const liveCreds = await getLiveCredentials(rawDbId);
    if (!liveCreds || !liveCreds.connectionString) {
      throw new Error("Live Database connection not found or expired.");
    }

    const connectionString = liveCreds.connectionString;
    const type = dbType?.toLowerCase() || "postgresql"; 

    
    if (["postgresql", "postgres", "supabase", "neon"].includes(type)) {
      const pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false }, 
        connectionTimeoutMillis: 5000,
      });

      const client = await pool.connect();
      try {
        const res = await client.query(sql);
       
        const result = isReadOnlyIntent
          ? res.rows
          : [{ message: "Success", rowsAffected: res.rowCount }];

        return {
          feedback: "Executed successfully on Live Postgres.",
          queryResult: result,
          retryCount: 0,
          routeDecision: ROUTES.ORCHESTRATOR,
        };
      } finally {
        client.release();
        await pool.end();
      }
    } else if (["mysql", "mariadb"].includes(type)) {
      const connection = await mysql.createConnection(connectionString);

      try {
        const [rows, fields] = await connection.execute(sql);

        const result = Array.isArray(rows)
          ? rows
          : [{ message: "Success", ...rows }];

        return {
          feedback: "Executed successfully on Live MySQL.",
          queryResult: result,
          retryCount: 0,
          routeDecision: ROUTES.ORCHESTRATOR,
        };
      } finally {
        await connection.end();
      }
    } else {
      throw new Error(`Unsupported Live Database Type: ${type}`);
    }
  }

  const sanitizedDbId = rawDbId.replace(/[^a-zA-Z0-9_-]/g, "");
  const dbPath = path.join(os.tmpdir(), `queryfit_${sanitizedDbId}.db`);

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
        const info = db.prepare(sql).run();
        result = [{ message: "Operation successful", changes: info.changes }];
      }

      return {
        feedback: "Query executed successfully on Local SQLite.",
        queryResult: result,
        retryCount: 0,
        routeDecision: ROUTES.ORCHESTRATOR,
      };
    } finally {
      if (db.open) db.close();
    }
  } catch (err) {
    throw new Error(`Local DB Error: ${(err as Error).message}`);
  }
});

export const complexQueryApproval = async (state: GraphState) => {
  const approved = interrupt({
    value: "The generated query may manipulate data. Do you want to proceed?",
    id: "ComplexQueryApproval",
  });

  if (approved.shouldContinue) {
    return new Command({
      update: {
        feedback:
          "User approved query. Now execute next step. i.e. go to executeQuery node",
        routeDecision: ROUTES.ORCHESTRATOR,
      },
      goto: ROUTES.ORCHESTRATOR,
    });
  }

  return new Command({
    update: {
      feedback:
        "User disapproved manipulation query. End the query by giving proper feed back to the user i.e. You disapprove the query you can ask new query.",
      routeDecision: ROUTES.ORCHESTRATOR,
    },
    goto: ROUTES.ORCHESTRATOR,
  });
};

export const queryPlanner = withFaultTolerance(
  async (state: GraphState, config?: LangGraphRunnableConfig) => {
    const prompt = await QUERY_PLANNER_PROMPT.format({
      tool_registry: JSON.stringify(TOOL_REGISTRY),
      user_query:state.messages.at(-1)?.content,
      schema:JSON.stringify(state.schema)
    });
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
  const safeQuery = validateAndFixQuery(state.sqlQuery, state.dbType);

  return {
    sqlQuery: safeQuery,
    feedback: "Query is safe. Proceed to execute next node.",
    routeDecision: ROUTES.ORCHESTRATOR,
    validatorScore: 9,
  };
});
interface rawMessage {
  text: string;
  type: string;
}
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

 

  if (!((res.raw as AIMessage).content instanceof Array) && res.parsed) {
    return {
      feedback: res.parsed.feedback,
      needsReplanning: res.parsed.needsReplanning,
      retryCount: res.parsed.retryCount,
      currentStepIndex: res.parsed.currentStepIndex,
      routeDecision: res.parsed.routeDecision,
    };
  }
  const custom = JSON.parse(
    ((res.raw as AIMessage).content[0] as rawMessage).text
  );
  console.log("this is routeDecision:", custom.routeDecision);
  return {
    feedback: custom.feedback,
    needsReplanning: custom.needsReplanning,
    retryCount: custom.retryCount,
    currentStepIndex: custom.currentStepIndex,
    routeDecision: custom.routeDecision,
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
console.log("res: ",res.content,"\n")
  return {
   messages: [
      new AIMessageChunk({
        ...res,
        additional_kwargs:{
          node:"general_chat"
        }
      })
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
console.log("res: ",res.content,"\n")
  return {
    routeDecision: ROUTES.END,
    messages: [
      new AIMessageChunk({
        ...res,
        additional_kwargs:{
          node:"general_chat"
        }
      })
    ],
    feedback: "",
    queryPlan: undefined,
    currentStepIndex: 0,
  };
});

export const generateChartData = withFaultTolerance(
  async (state: GraphState) => {
    const prompt = await CHART_GENERATOR_PROMPT.format({
      queryResult: JSON.stringify(state.queryResult.slice(0, 5)),
      chatHistory: JSON.stringify(state.messages.slice(-3)),
    });
    const res = await chartGeneratorLlm.invoke([
      new SystemMessage(prompt),
      ...state.messages,
    ]);
    return {
      ui: {
        config: res,
        data: state.queryResult,
      },
      feedback: "Chart generate successfully. now summerize data",
      routeDecision: ROUTES.ORCHESTRATOR,
    };
  }
);
