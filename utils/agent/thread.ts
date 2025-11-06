import { Client } from "@langchain/langgraph-sdk/client";

const client = new Client({apiUrl:"http://localhost:2024"})
export const thread = await client.threads.create()