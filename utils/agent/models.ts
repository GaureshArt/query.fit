import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import * as z from "zod";
const IIntentEvaluatorLlmSchema = z.object({
  isQueryReadOnly: z.boolean().describe("give false if its complex otherwise true if its only retriveing query"),
});
const IQueryGeneratorLlmSchema = z.object({
  query: z.string().describe("THis will hold query that can be executed on dabase without any extra steps"),
  isIncomplete:z.boolean(),
  reasone:z.string().describe("Explain user what need to make meaningful query and give proper reason for it.")
});

const ISummarizerLlmSchema = z.object({
  output:z.string().describe("This is summarize output of the given query output")
})
export const intentEvaluatorLlm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: process.env.GOOGLE_API_KEY,
  temperature: 0,
}).withStructuredOutput(IIntentEvaluatorLlmSchema);

export const queryGeneratorLlm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  outputVersion:"v1",
  apiKey: process.env.GOOGLE_API_KEY,
  temperature: 0.3,
  
}).withStructuredOutput(IQueryGeneratorLlmSchema);


export const queryAnswerSummarizerLlm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: process.env.GOOGLE_API_KEY,
  temperature: 0.3,
   
}).withStructuredOutput(ISummarizerLlmSchema);
