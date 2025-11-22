import * as z from "zod";
import { BaseMessage } from "@langchain/core/messages";
import { registry } from "@langchain/langgraph/zod";
import {addMessages} from "@langchain/langgraph"
import { queryPlannerLlmSchema } from "./models";

export const graphState = z.object({
  messages: z.array(z.custom<BaseMessage>()).register(registry, {
    reducer: {
      fn: addMessages,
    },
    default: () => [] as BaseMessage[],
  }),   
  dbId: z.string(),
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
      "validator",
      "orchestrator",
      "__end__"
    ])
    .optional(),
  lastError: z.string().optional(),
  retryCount: z.number().default(0),
  needsReplanning: z.boolean().default(false),
  chartSpec: z.any().optional(),
  answeredQuery: z.boolean().optional(),
  feedback: z.string().optional(),
  validatorScore:z.number().optional(),
 ui: z
    .array(z.unknown()) 
    .optional()
    .default([]),
  queryPlan: z.custom<z.infer<typeof queryPlannerLlmSchema>>().optional(),
});

export type GraphState = z.infer<typeof graphState>;
