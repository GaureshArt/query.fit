import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import * as z from "zod";
const queryGeneratorLlmSchema = z.object({
  query: z
    .string()
    .describe(
      "THis will hold query that can be executed on dabase without any extra steps"
    ),
  isIncomplete: z.boolean(),
  reason: z
    .string()
    .describe(
      "Explain user what need to make meaningful query and give proper reason for it."
    ),
});

const summarizerLlmSchema = z.object({
  output: z
    .string()
    .describe("This is summarize output of the given query output"),
});

export const queryGeneratorLlm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  outputVersion: "v1",
  apiKey: process.env.GOOGLE_API_KEY,
  temperature: 0.3,
}).withStructuredOutput(queryGeneratorLlmSchema);

export const queryAnswerSummarizerLlm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: process.env.GOOGLE_API_KEY,
  temperature: 0.3,
}).withStructuredOutput(summarizerLlmSchema);

export const chartGeneratorLlm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: process.env.GOOGLE_API_KEY,
  temperature: 0,
});

export const queryPlannerLlmSchema = z.object({
  intent: z.enum([
    "general",
    "retrieval",
    "manipulation",
    "visual-analytical",
    "multi-step",
  ]),
  steps: z.array(
    z.object({
      step_number: z.number().describe("Number of the step to execute."),
      tool_name: z.string().describe("name of the tool need to use "),
      description: z
        .string()
        .describe("Explain user why need this tool in simple language"),
      ui_message: z
        .string()
        .describe("Message to show user while performing this"),
    })
  ),
});

export const queryPlannerLlm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: process.env.GOOGLE_API_KEY,
  temperature: 0,
  streaming: false,
}).withStructuredOutput(queryPlannerLlmSchema);

export const generalChatLlm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: process.env.GOOGLE_API_KEY,
  temperature: 0,
});

export const validatorLlmSchema = z.object({
  feedback: z.string().describe("Feedback for orchestrator or generateQuery"),
  routeDecision: z
    .enum(["orchestrator", "generateQuery"])
    .default("orchestrator"),
});
export const validatorLlm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: process.env.GOOGLE_API_KEY,
  temperature: 0,
}).withStructuredOutput(validatorLlmSchema);

export const queryClarifierSchema = z.object({
  message: z.string().describe("message give to the user for clarification"),
});
export const queryClarifierLlm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: process.env.GOOGLE_API_KEY,
  temperature: 0,
}).withStructuredOutput(queryClarifierSchema);

export const queryOrchestratorLlmSchema = z.object({
  currentStepIndex: z
    .number()
    .describe(
      "decide which step must do now like do current step again or next "
    ),
  routeDecision: z
    .enum([
      "generateSchema",
      "generateQuery",
      "executeQuery",
      "validator",
      "summarizeOutput",
      "generalChat",
      "complexQueryApproval",
      "queryPlanner",
      "__end__",
    ])
    .describe("Decide which node to go by settign its name"),
  retryCount: z
    .number()
    .describe(
      "set retrycoutn to 0 if previous errors got resolve or its a new conversation. otherwise set as it is"
    ),
  needsReplanning: z
    .boolean()
    .default(false)
    .describe(
      "set to true if given plan by planner node is not good or effcient and route to planner node "
    )
    .optional(),
  feedback: z
    .string()
    .describe(
      "give feedback to the next nodes if needed to make better result otherwise make it empty"
    )
    .optional(),
});
export const queryOrchestratorLlm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: process.env.GOOGLE_API_KEY,
  temperature: 0.1,
}).withStructuredOutput(queryOrchestratorLlmSchema);
