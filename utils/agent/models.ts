import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import * as z from "zod";
const IQueryEvaluatorLlmSchema = z.object({
  isQueryReadOnly: z.boolean(),
});
const IQueryGeneratorLlmSchema = z.object({
  query: z.string(),
  isIncomplete:z.boolean(),
  reasone:z.string().describe("Explain user what need to make meaningful query and give proper reason for it.")
});

export const queryEvaluatorLlm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: process.env.GOOGLE_API_KEY,
  temperature: 0,
  maxOutputTokens: 50,
}).withStructuredOutput(IQueryEvaluatorLlmSchema);

export const queryGeneratorLlm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: process.env.GOOGLE_API_KEY,
  temperature: 0.3,
  maxOutputTokens: 100,
}).withStructuredOutput(IQueryGeneratorLlmSchema);


export const queryAnswerSummarizerLlm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-pro",
  apiKey: process.env.GOOGLE_API_KEY,
  temperature: 0.3,
  maxOutputTokens: 150,
});
