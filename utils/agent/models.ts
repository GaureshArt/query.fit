import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import * as z from "zod";
import {ChatMistralAI} from "@langchain/mistralai"
const GEMINI_MODEL_NAME = "gemini-2.5-flash";
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

const commonConfig = {
  model: GEMINI_MODEL_NAME,
  apiKey: GOOGLE_API_KEY,
};

export const queryPlannerLlmSchema = z.object({
  reasoning: z
    .string()
    .describe(
      "Explain why you chose this specific plan and intent based on user context and tool availability."
    ),
  intent: z
    .enum([
      "general",
      "retrieval",
      "manipulation",
      "visualization",
      "multi-step",
    ])
    .describe(
      "Classify the user's intent. Use 'multi-step' if the request involves both chatting and database actions."
    ),

  steps: z.array(
    z.object({
      step_number: z.number().describe("The execution order number."),
      tool_name: z
        .enum([
          "generateSchema",
          "generateQuery",
          "queryPlanner",
          "executeQuery",
          "generateChart",
          "summarizeOutput",
          "generalChat",
          "complexQueryApproval",
        ])
        .describe("The specific tool from the registry to use."),
      description: z
        .string()
        .describe("Internal technical note on why this tool is used."),
      ui_message: z
        .string()
        .describe(
          "A user-friendly status message to display on the frontend (e.g., 'Scanning database structure...', 'Asking for permission...')."
        ),
    })
  ),
});

export const queryPlannerLlm = new ChatGoogleGenerativeAI({
  ...commonConfig,
  temperature: 0,
}).withStructuredOutput(queryPlannerLlmSchema, { name: "planner_output" });


export const queryOrchestratorLlmSchema = z.object({
  currentStepIndex: z
    .number()
    .describe(
      "Decide which step index to execute next (repeat current or move to next)."
    ),
  routeDecision: z
    .enum([
      "generateSchema",
      "generateQuery",
      "executeQuery",
      "validator",
      "orchestrator",
      "summarizeOutput",
      "generateChart",
      "generalChat",
      "complexQueryApproval",
      "queryPlanner",
      "__end__",
    ])
    .describe("Decide which node to route to next based on state."),
  retryCount: z
    .number()
    .describe(
      "Set to 0 if errors resolved, otherwise increment existing count. if trying to to the same step."
    ),
  needsReplanning: z
    .boolean()
    .default(false)
    .describe("Set to true if the current plan is inefficient or failing.")
    .optional(),
  feedback: z
    .string()
    .describe(
      "Feedback for the next step to give better results"
    ),
});

export const queryOrchestratorLlm = new ChatGoogleGenerativeAI({
  ...commonConfig,
  temperature: 0,
}).withStructuredOutput(queryOrchestratorLlmSchema, {
  name: "orchestrator_output",
});


export const queryOrchestratorLlmMistral = new ChatMistralAI({
  model:"mistral-large-2407",
  apiKey:process.env.MISTRAL_API_KEY,
  temperature:0,

}).withStructuredOutput(queryOrchestratorLlmSchema, {
  name: "orchestrator_output",
})

// ----------------------------------------
// Query Generator
// ----------------------------------------
const queryGeneratorLlmSchema = z.object({
  query: z
    .string()
    .describe(
      "The SQL query ready for execution without further modification."
    ),
  isIncomplete: z
    .boolean()
    .describe("True if the query cannot be generated due to missing info."),
  reason: z
    .string()
    .describe("Explanation for the user if the query is incomplete."),
});

export const queryGeneratorLlm = new ChatGoogleGenerativeAI({
  ...commonConfig,
  temperature: 0.1, // Slightly higher for creative query construction
}).withStructuredOutput(queryGeneratorLlmSchema, { name: "query_gen_output" });


export const queryAnswerSummarizerLlm = new ChatGoogleGenerativeAI({
  ...commonConfig,
  temperature: 0.3,
});

// ----------------------------------------
// General Chat Model
// ----------------------------------------
export const generalChatLlm = new ChatGoogleGenerativeAI({
  ...commonConfig,
  temperature: 0.3,
});

// ----------------------------------------
// Validator Model
// ----------------------------------------
export const validatorLlmSchema = z.object({
  feedback: z
    .string()
    .describe("Constructive feedback for the orchestrator or query generator."),
  routeDecision: z
    .enum(["orchestrator", "generateQuery"])
    .default("orchestrator")
    .describe("Where to route the flow based on validation results."),
    validatorScore:z.number().describe("Score between 1-10 if close to 10 then passed if its below 6 then faiedl")
});

export const validatorLlm = new ChatGoogleGenerativeAI({
  ...commonConfig,
  temperature: 0,
}).withStructuredOutput(validatorLlmSchema, { name: "validator_output" });

export const queryClarifierSchema = z.object({
  message: z.string().describe("The natural language question to ask the user to resolve the ambiguity."),
});

export const queryClarifierLlm = new ChatGoogleGenerativeAI({
  ...commonConfig,
  temperature: 0,
}).withStructuredOutput(queryClarifierSchema, { name: "clarifier_output" });






export const chartConfigSchema = z.object({
  title: z.string().describe("A short, descriptive title for the chart"),
  description: z.string().describe("A short description or subtitle"),
  type: z.enum(["bar", "line", "pie"]).describe(" The type of chart to render"),
  
  // The Key for the X-Axis (The Grouping)
  xAxisKey: z.string().describe("Choose exact same data key name from query result"),
  
  // The Keys for the Data Series (The Bars)
  series: z.array(
    z.object({
      dataKey: z.string().describe("Choose exact same data key name from query result"),
      label: z.string().describe("Human-readable label for the legend/tooltip (e.g., 'Desktop Sales')"),
      color: z.string().optional().describe("Optional hex code, otherwise frontend assigns defaults"),
      stackedId: z.string().optional().describe("If the chart should be stacked, give same ID to series that belong together"),
    })
  ).describe("Array of data series to plot. For a simple bar chart, this often has just one item."),
});

// The Full Response expected from LLM


export const chartGeneratorLlm = new ChatGoogleGenerativeAI({
  ...commonConfig
}).withStructuredOutput(chartConfigSchema,{name:"chart_generator"})