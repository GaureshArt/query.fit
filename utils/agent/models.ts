
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatDeepSeek } from "@langchain/deepseek";
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatOpenAI } from "@langchain/openai";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import * as z from "zod";


export type ModelProvider = "gemini" | "deepseek" | "mistral" | "openai";

interface ModelConfig {
  provider?: ModelProvider;
  modelName?: string;
  temperature?: number;
  streaming?: boolean;
}

export function initModel(config: ModelConfig = {}): BaseChatModel {
  const provider =
    config.provider ||
    (process.env.NEXT_PUBLIC_LLM_PROVIDER as ModelProvider) ||
    "gemini";

  const temperature = config.temperature ?? 0;
  const streaming = config.streaming ?? true;

  switch (provider) {
    case "gemini":
      return new ChatGoogleGenerativeAI({
        model: config.modelName || "gemini-1.5-flash", // Fast & Cheap default
        temperature,
        streaming,
        apiKey: process.env.GOOGLE_API_KEY,
        maxRetries: 2,
      });

    case "deepseek":
   
      return new ChatDeepSeek({
        model:"deepseek/deepseek-prover-v2",
        temperature,
        apiKey: process.env.DEEPSEEK_API_KEY,
        configuration: {
          
          baseURL: "https://openrouter.ai/api/v1", 
        },
      });

    case "mistral":
      return new ChatMistralAI({
        model: config.modelName || "mistral-large-latest",
        apiKey: process.env.MISTRAL_API_KEY,
        temperature,
      });

    case "openai":
      return new ChatOpenAI({
        model:"openai/gpt-oss-20b:free",
        temperature,
        streaming,
        apiKey: process.env.OPENAI_API_KEY,
        configuration:{
          baseURL: "https://openrouter.ai/api/v1", 
        }
      });

    default:
      throw new Error(`❌ Unsupported Provider: ${provider}`);
  }
}


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
          "A user-friendly status message to display on the frontend (e.g., 'Scanning database structure...')."
        ),
    })
  ),
});

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
      
      "__end__",
    ])
    .describe("Decide which node to route to next based on state."),
  retryCount: z
    .number()
    .describe(
      "Set to 0 if errors resolved, otherwise increment existing count if trying the same step."
    ),
  needsReplanning: z
    .boolean()
    .default(false)
    .describe("Set to true if the current plan is inefficient or failing.")
    .optional(),
  feedback: z
    .string()
    .describe("Feedback for the next step to give better results"),
});

const queryGeneratorLlmSchema = z.object({
  query: z
    .string()
    .describe("The SQL query ready for execution without further modification."),
  isIncomplete: z
    .boolean()
    .describe("True if the query cannot be generated due to missing info."),
  reason: z
    .string()
    .describe("Explanation for the user if the query is incomplete."),
});

export const validatorLlmSchema = z.object({
  feedback: z
    .string()
    .describe("Constructive feedback for the orchestrator or query generator."),
  routeDecision: z
    .enum(["orchestrator", "generateQuery"])
    .default("orchestrator")
    .describe("Where to route the flow based on validation results."),
  validatorScore: z
    .number()
    .describe(
      "Score between 1-10 if close to 10 then passed if its below 6 then failed"
    ),
});

export const queryClarifierSchema = z.object({
  message: z
    .string()
    .describe(
      "The natural language question to ask the user to resolve the ambiguity."
    ),
});

export const chartConfigSchema = z.object({
  title: z.string().describe("A short, descriptive title for the chart"),
  description: z.string().describe("A short description or subtitle"),
  type: z.enum(["bar", "line", "pie"]).describe("The type of chart to render"),
  xAxisKey: z
    .string()
    .describe("Choose exact same data key name from query result"),
  series: z
    .array(
      z.object({
        dataKey: z
          .string()
          .describe("Choose exact same data key name from query result"),
        label: z
          .string()
          .describe(
            "Human-readable label for the legend/tooltip (e.g., 'Desktop Sales')"
          ),
        color: z
          .string()
          .optional()
          .describe("Optional hex code, otherwise frontend assigns defaults"),
        stackedId: z
          .string()
          .optional()
          .describe(
            "If the chart should be stacked, give same ID to series that belong together"
          ),
      })
    )
    .describe("Array of data series to plot."),
});


export const queryPlannerLlm = initModel({ temperature: 0 }).withStructuredOutput(
  queryPlannerLlmSchema,
  { name: "planner_output", includeRaw: true }
);

export const queryOrchestratorLlm = initModel({
  temperature: 0,
}).withStructuredOutput(queryOrchestratorLlmSchema, {
  name: "orchestrator_output",
  includeRaw: true,
});

export const queryGeneratorLlm = initModel({
  temperature: 0.1, 
}).withStructuredOutput(queryGeneratorLlmSchema, { name: "query_gen_output" });

export const validatorLlm = initModel({ temperature: 0 }).withStructuredOutput(
  validatorLlmSchema,
  { name: "validator_output" }
);

export const queryClarifierLlm = initModel({
  temperature: 0,
}).withStructuredOutput(queryClarifierSchema, { name: "clarifier_output" });

export const chartGeneratorLlm = initModel({
  temperature: 0,
}).withStructuredOutput(chartConfigSchema, { name: "chart_generator" });

export const queryAnswerSummarizerLlm = initModel({ temperature: 0.3 });
export const generalChatLlm = initModel({ temperature: 0.3 });