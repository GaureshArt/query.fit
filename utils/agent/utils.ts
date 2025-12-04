import { Parser } from "node-sql-parser";

const DB_DIALECTS: Record<string, string> = {
  postgres: "postgresql",
  supabase: "postgresql",
  mysql: "mysql",
  sqlite: "sqlite",
};

export const validateAndFixQuery = (
  sql: string,
  dbType: string = "mysql"
) => {
  const parser = new Parser();
  const dialect = DB_DIALECTS[dbType.toLowerCase()] || "mysql";
  let ast;

  try {
    ast = parser.astify(sql, { database: dialect });
  } catch (err) {
    throw new Error(`Syntax Error: The generated SQL is invalid. ${err}`);
  }

  const commands = Array.isArray(ast) ? ast : [ast];

  for (const cmd of commands) {
    if (cmd.type !== "select") {
      throw new Error(
        `Security Alert: Only SELECT queries are allowed. Attempted: ${cmd.type}`
      );
    }
  }

  commands.forEach((cmd) => {
    if (cmd.type === "select" && !cmd.limit) {
      cmd.limit = {
        seperator: "",
        value: [{ type: "number", value: 50 }],
      };
    } else if (
      cmd.type === "select" &&
      cmd.limit &&
      cmd.limit.value &&
      cmd.limit.value[0].value > 100
    ) {
      cmd.limit.value[0].value = 100;
    }
  });

  const safeSql = parser.sqlify(ast, { database: "postgresql" });
  return safeSql;
};
