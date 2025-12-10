import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatDeepSeek } from "@langchain/deepseek";
import { ChatMoonshot } from "@langchain/community/chat_models/moonshot";
import { ChatGroq } from "@langchain/groq";
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatOpenAI } from "@langchain/openai";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import {
  chartConfigSchema,
  queryClarifierSchema,
  queryGeneratorLlmSchema,
  queryOrchestratorLlmSchema,
  queryPlannerLlmSchema,
  validatorLlmSchema,
} from "./model-schema";
import { tool } from "@langchain/core/tools";

export type ModelProvider =
  | "gemini"
  | "deepseek"
  | "mistral"
  | "openai"
  | "moonshot"
  | "groq";

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
        model: "gemini-2.5-flash",
        temperature,
        streaming,
        apiKey: process.env.GOOGLE_API_KEY,
        maxRetries: 2,
      });

    case "deepseek":
      return new ChatDeepSeek({
        model: "deepseek/deepseek-prover-v2",
        temperature,
        apiKey: process.env.DEEPSEEK_API_KEY,
        configuration: {
          baseURL: "https://openrouter.ai/api/v1",
        },
      });

    case "mistral":
      return new ChatMistralAI({
        model: "mistral-large-2512",
        apiKey: process.env.MISTRAL_API_KEY,
        temperature: 0,
      });

    case "openai":
      return new ChatOpenAI({
        model: "openai/gpt-oss-20b:free",
        temperature,
        streaming,
        apiKey: process.env.OPENAI_API_KEY,
        configuration: {
          baseURL: "https://openrouter.ai/api/v1",
        },
      });

    case "moonshot":
      return new ChatMoonshot({
        apiKey: process.env.MOONSHOT_API_KEY,
        model: "moonshotai/kimi-k2:free",
      });
    case "groq":
      return new ChatGroq({
        model: "openai/gpt-oss-120b",
        temperature: 0,
  
        apiKey: process.env.GROQ_API_KEY,
      });

    default:
      throw new Error(`❌ Unsupported Provider: ${provider}`);
  }
}

export const queryPlannerLlm = initModel({
  temperature: 0,
}).withStructuredOutput(queryPlannerLlmSchema, {
  name: "planner_output",
});

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
