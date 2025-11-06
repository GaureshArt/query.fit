import Database from "better-sqlite3";
import { intentEvaluatorLlm, queryGeneratorLlm } from "./models";
import { GraphState } from "./state";
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import path from "path";
import os from "os";
import {
  INTENT_EVALUATOR_SYSTEM_PROMPT,
  QUERY_GENERATOR_SYSTEM_PROMPT,
} from "./prompts";
import { Command, interrupt } from "@langchain/langgraph";




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
    messages:[new AIMessage(JSON.stringify(queryResult))],
    queryResult: queryResult,
  };
};

export const complexQueryApproval = async (state: GraphState) => {
  const approved = interrupt(
    "Warning: This query appears to modify or delete data. Are you sure you want to proceed?"
  );
  if (approved) {
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
