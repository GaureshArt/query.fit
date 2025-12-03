import { LangGraphRunnableConfig } from "@langchain/langgraph";
import { GraphState, ROUTES } from "./state";
import { NodeFunction } from "./types";

export const withFaultTolerance = <T extends GraphState>(
  nodeLogic: NodeFunction<T>
): NodeFunction<T> => {
  return async (state: T, config?: LangGraphRunnableConfig) => {
    try {
      return await nodeLogic(state, config);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.log("Yep this is get caught bytry")
      return {
        feedback: `System Error: ${errorMessage}. Analyze this error and try a different approach.`,
        retryCount: (state.retryCount || 0) + 1,
        routeDecision: ROUTES.ORCHESTRATOR, 
      } as Partial<T>;
    }
  };
};

