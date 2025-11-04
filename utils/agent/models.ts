import {ChatGoogleGenerativeAI} from "@langchain/google-genai"
import * as z from "zod"
const IQueryEvaluatorLlmSchema = z.object({
    isQueryReadOnly:z.boolean()
})
const IQueryGeneratorLlmSchema = z.object({
    query:z.string()
})

 export const queryEvaluatorLlm = new ChatGoogleGenerativeAI({
    model:'gemini-2.5-flash',
    apiKey:process.env.GOOGLE_API_KEY,
    temperature:0,
    maxOutputTokens:50,
}).withStructuredOutput(IQueryEvaluatorLlmSchema)

export const queryGeneratorLlm = new ChatGoogleGenerativeAI({
    model:'gemini-2.5-flash',
    apiKey:process.env.GOOGLE_API_KEY,
    temperature:.3,
    maxOutputTokens:100,
}).withStructuredOutput(IQueryGeneratorLlmSchema)
export const queryAnswerSummarizerLlm = new ChatGoogleGenerativeAI({
    model:'gemini-2.5-pro',
    apiKey:process.env.GOOGLE_API_KEY,
    temperature:.3,
    maxOutputTokens:150,
})



