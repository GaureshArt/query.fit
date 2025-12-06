import * as z from "zod";
import { BaseMessage } from "@langchain/core/messages";
import { registry } from "@langchain/langgraph/zod";
import { addMessages } from "@langchain/langgraph";
import { chartConfigSchema, queryPlannerLlmSchema } from "./models";

export const ROUTES = {
  GENERATE_SCHEMA: "generateSchema",
  GENERATE_QUERY: "generateQuery",
  QUERY_CLARIFIER: "queryClarifier",
  EXECUTE_QUERY: "executeQuery",
  SUMMARIZE_OUTPUT: "summarizeOutput",
  COMPLEX_QUERY_APPROVAL: "complexQueryApproval",
  QUERY_PLANNER: "queryPlanner",
  GENERAL_CHAT: "generalChat",
  VALIDATOR: "validator",
  ORCHESTRATOR: "orchestrator",
  END: "__end__",
} as const;

export const graphState = z.object({
  messages: z.array(z.custom<BaseMessage>()).register(registry, {
    reducer: {
      fn: addMessages,
    },
    default: () => [] as BaseMessage[],
  }),
  dbId: z.string(),
  dbType: z.enum(["mysql", "postgresql", "supabase", "neon"]),
  schema: z.string().optional(),
  sqlQuery: z.string().optional(),
  queryResult: z.any().optional(),
  currentStepIndex: z.number().default(0),
  routeDecision: z
    .enum([
      "generateSchema",
      "generateQuery",
      "queryClarifier",
      "executeQuery",
      "summarizeOutput",
      "complexQueryApproval",
      "queryPlanner",
      "generalChat",
      "generateChart",
      "validator",
      "orchestrator",
      "__end__",
    ])
    .optional(),
  lastError: z.string().optional(),
  retryCount: z.number().default(0),
  needsReplanning: z.boolean().default(false),
  chartSpec: z.any().optional(),
  answeredQuery: z.boolean().optional(),
  feedback: z.string().optional(),
  validatorScore: z.number().optional(),
  ui: z.object({
    config: chartConfigSchema,
    data: z.any(),
  }),
  queryPlan: z.custom<z.infer<typeof queryPlannerLlmSchema>>().optional(),
});

export type GraphState = z.infer<typeof graphState>;
