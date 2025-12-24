import { PostgresStore, } from "@langchain/langgraph-checkpoint-postgres/store";
import { PostgresSaver, } from "@langchain/langgraph-checkpoint-postgres";

export const store = PostgresStore.fromConnString(process.env.DB_URI!);
export const checkpointer = PostgresSaver.fromConnString(process.env.DB_URI!);


