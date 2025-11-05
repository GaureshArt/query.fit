import Database from "better-sqlite3";
import { queryEvaluatorLlm, queryGeneratorLlm } from "./models";
import { GraphState } from "./state";
import { AIMessage } from "@langchain/core/messages";
import path from "path";
import os from "os";
import {
  QUERY_EVALUATOR_SYSTEM_PROMPT,
  QUERY_GENERATOR_SYSTEM_PROMPT,
} from "./prompts";
import { Command, interrupt } from "@langchain/langgraph";

export const queryEvaluator = async (state: GraphState) => {
  const res = await queryEvaluatorLlm.invoke([
    ...QUERY_EVALUATOR_SYSTEM_PROMPT,
    ...state.messages,
  ]);
  if (res.isQueryReadOnly) {
    return "checkSchema";
  }
  return "complexQueryApproval";
};

export const checkSchema = async (state: GraphState) => {
  if (state.schema) {
    return "generateQuery";
  }
  return "generateSchema";
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

export const complexQueryApproval = (state: GraphState) => {
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
