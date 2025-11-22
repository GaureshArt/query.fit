import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import * as z from "zod";



// ----------------------------------------
// CONFIGURATION
// ----------------------------------------
// Centralized model config to keep things consistent
const GEMINI_MODEL_NAME = "gemini-2.5-flash";
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

const commonConfig = {
  model: GEMINI_MODEL_NAME,
  apiKey: GOOGLE_API_KEY,
};

// ----------------------------------------
// Query Planner
// ----------------------------------------
export const queryPlannerLlmSchema = z.object({
  // Added reasoning to force internal monologue before classification
  reasoning: z.string().describe("Explain why you chose this specific plan and intent based on user context and tool availability."),
  
  intent: z.enum([
    "general",
    "retrieval",
    "manipulation", 
    "visual-analytical",
    "multi-step", 
  ]).describe("Classify the user's intent. Use 'multi-step' if the request involves both chatting and database actions."),
  
  steps: z.array(
    z.object({
      step_number: z.number().describe("The execution order number."),
      tool_name: z.enum([
        "generateSchema", 
        "generateQuery", 
        "queryPlanner", 
        "executeQuery", 
        "summarizeOutput", 
        "generalChat", 
        "complexQueryApproval"
      ]).describe("The specific tool from the registry to use."),
      description: z
        .string()
        .describe("Internal technical note on why this tool is used."),
      ui_message: z
        .string()
        .describe("A user-friendly status message to display on the frontend (e.g., 'Scanning database structure...', 'Asking for permission...')."),
    })
  ),
});

export const queryPlannerLlm = new ChatGoogleGenerativeAI({
  ...commonConfig,
  temperature: 0, 
}).withStructuredOutput(queryPlannerLlmSchema, { name: "planner_output" });

// ----------------------------------------
// Orchestrator
// ----------------------------------------
export const queryOrchestratorLlmSchema = z.object({
  currentStepIndex: z
    .number()
    .describe("Decide which step index to execute next (repeat current or move to next)."),
  routeDecision: z
    .enum([
      "generateSchema",
      "generateQuery",
      "executeQuery",
      "validator",
      "orchestrator",
      "summarizeOutput",
      "generalChat",
      "complexQueryApproval",
      "queryPlanner",
      "__end__",
    ])
    .describe("Decide which node to route to next based on state."),
  retryCount: z
    .number()
    .describe("Set to 0 if errors resolved, otherwise increment existing count."),
  needsReplanning: z
    .boolean()
    .default(false)
    .describe("Set to true if the current plan is inefficient or failing.")
    .optional(),
  feedback: z
    .string()
    .describe("Feedback for the next node to improve results, or empty string if none."),
});

export const queryOrchestratorLlm = new ChatGoogleGenerativeAI({
  ...commonConfig,
  temperature: 0,
}).withStructuredOutput(queryOrchestratorLlmSchema, { name: "orchestrator_output" });


// ----------------------------------------
// Query Generator
// ----------------------------------------
const queryGeneratorLlmSchema = z.object({
  query: z
    .string()
    .describe("The SQL query ready for execution without further modification."),
  isIncomplete: z.boolean().describe("True if the query cannot be generated due to missing info."),
  reason: z
    .string()
    .describe("Explanation for the user if the query is incomplete."),
});

export const queryGeneratorLlm = new ChatGoogleGenerativeAI({
  ...commonConfig,
  temperature: 0.1, // Slightly higher for creative query construction
}).withStructuredOutput(queryGeneratorLlmSchema, { name: "query_gen_output" });


// ----------------------------------------
// Summarizer
// ----------------------------------------
const summarizerLlmSchema = z.object({
  output: z
    .string()
    .describe("A natural language summary of the database query results."),
});

export const queryAnswerSummarizerLlm = new ChatGoogleGenerativeAI({
  ...commonConfig,
  temperature: 0.3,

});


// ----------------------------------------
// Chart Generator (Text Only)
// ----------------------------------------
export const chartGeneratorLlm = new ChatGoogleGenerativeAI({
  ...commonConfig,
  temperature: 0,
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
  feedback: z.string().describe("Constructive feedback for the orchestrator or query generator."),
  routeDecision: z
    .enum(["orchestrator", "generateQuery"])
    .default("orchestrator")
    .describe("Where to route the flow based on validation results."),
});

export const validatorLlm = new ChatGoogleGenerativeAI({
  ...commonConfig,
  temperature: 0,
}).withStructuredOutput(validatorLlmSchema, { name: "validator_output" });


// ----------------------------------------
// Query Clarifier
// ----------------------------------------
export const queryClarifierSchema = z.object({
  message: z.string().describe("Clarification question to ask the user."),
});

export const queryClarifierLlm = new ChatGoogleGenerativeAI({
  ...commonConfig,
  temperature: 0,
}).withStructuredOutput(queryClarifierSchema, { name: "clarifier_output" });