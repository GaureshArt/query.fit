import { Parser } from "node-sql-parser";

const DB_DIALECTS: Record<string, string> = {
  postgres: "postgresql",
  supabase: "postgresql",
  mysql: "mysql",
  neon:"postgresql"
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

  commands.forEach((cmd: any) => {
    if (cmd.type !== "select") {
      throw new Error(
        `Security Alert: Only SELECT queries are allowed. Attempted: ${cmd.type}`
      );
    }

    const hasNoLimit = !cmd.limit || !cmd.limit.value || cmd.limit.value.length === 0;

    if (hasNoLimit) {
      cmd.limit = {
        seperator: "",
        value: [{ type: "number", value: 50 }],
      };
    } 
    else {
      
      const limitVal = cmd.limit.value[0];
      
      if (limitVal && limitVal.value > 100) {
        limitVal.value = 100; // Cap it
      }
    }
  });

  const safeSql = parser.sqlify(ast, { database: dialect });
  console.log("safeSql: ",safeSql)  
  return safeSql;
};




import { createClient } from "@supabase/supabase-js"; 
import { decrypt } from "@/lib/helper";

export async function getLiveCredentials(dbId: string) {
  // 1. Basic Validation
  if (!dbId || !dbId.startsWith("live_")) return null;

  const realDbId = dbId.replace("live_", "");

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
    );

    const { data, error } = await supabase
      .from("user_db_credentials")
      .select("encrypted_connection_string,db_type")
      .eq("id", realDbId)
      .single();

    if (error) {
      console.error("Supabase Error in Agent:", error.message); 
      return null;
    }

    if (!data) return null;

    return {
      connectionString: decrypt(data.encrypted_connection_string),
      dbType:data.db_type
    };

  } catch (err) {
    console.error("Critical Error in getLiveCredentials:", err);
    return null;
  }
}