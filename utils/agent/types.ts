import { LangGraphRunnableConfig, Command } from "@langchain/langgraph";

export type NodeFunction<T> = (
  state: T, 
  config?: LangGraphRunnableConfig
) => Promise<Partial<T> | Command>;