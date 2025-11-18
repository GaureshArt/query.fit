import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
// import {ChatOpenAI} from "@langchain/openai"
// import {ChatAnthropic} from "@langchain/anthropic"
import * as z from "zod";
// import {ChatGroq} from "@langchain/groq"
// const queryGeneratorLlmSchema = z.object({
//   query: z
//     .string()
//     .describe(
//       "THis will hold query that can be executed on dabase without any extra steps"
//     ),
//   isIncomplete: z.boolean(),
//   reason: z
//     .string()
//     .describe(
//       "Explain user what need to make meaningful query and give proper reason for it."
//     ),
// });

// const summarizerLlmSchema = z.object({
//   output: z
//     .string()
//     .describe("This is summarize output of the given query output"),
// });

// export const queryGeneratorLlm = new ChatGroq({
//   model: "llama-3.3-70b-versatile",
//   apiKey: process.env.GROQ_API_KEY,
//   temperature: 0.3,
// }).withStructuredOutput(queryGeneratorLlmSchema,{strict:true});

// export const queryAnswerSummarizerLlm = new ChatGroq({
//   model: "llama-3.3-70b-versatile",
//   apiKey: process.env.GROQ_API_KEY,
//   temperature: 0.3,
// }).withStructuredOutput(summarizerLlmSchema,{strict:true});

// export const chartGeneratorLlm = new ChatGroq({
//   model: "llama-3.3-70b-versatile",
//   apiKey: process.env.GROQ_API_KEY,
//   temperature: 0,
// });

// export const queryPlannerLlmSchema = z.object({
//   intent: z.enum([
//     "general",
//     "retrieval",
//     "manipulation",
//     "visual-analytical",
//     "multi-step",
//   ]),
//   steps: z.array(
//     z.object({
//       step_number: z.number().describe("Number of the step to execute."),
//       tool_name: z.string().describe("name of the tool need to use "),
//       description: z
//         .string()
//         .describe("Explain user why need this tool in simple language"),
//       ui_message: z
//         .string()
//         .describe("Message to show user while performing this"),
//     })
//   ),
// });

// export const queryPlannerLlm = new ChatGroq({
//   model: "llama-3.3-70b-versatile",
//   apiKey: process.env.GROQ_API_KEY,
//   temperature: 0,
// }).withStructuredOutput(queryPlannerLlmSchema);

// export const generalChatLlm = new ChatGroq({
//   model: "llama-3.3-70b-versatile",
//   apiKey: process.env.GROQ_API_KEY,
//   temperature: 0,
// });

// export const validatorLlmSchema = z.object({
//   feedback: z.string().describe("Feedback for orchestrator or generateQuery"),
//   routeDecision: z
//     .enum(["orchestrator", "generateQuery"])
//     .default("orchestrator"),
// });
// export const validatorLlm = new ChatGroq({
//   model: "llama-3.3-70b-versatile",
//   apiKey: process.env.GROQ_API_KEY,
//   temperature: 0,
//    streaming: false,
// }).withStructuredOutput(validatorLlmSchema,{strict:true});

// export const queryClarifierSchema = z.object({
//   message: z.string().describe("message give to the user for clarification"),
// });
// export const queryClarifierLlm = new ChatGroq({
//   model: "llama-3.3-70b-versatile",
//   apiKey: process.env.GROQ_API_KEY,
//   temperature: 0,
//    streaming: false,
// }).withStructuredOutput(queryClarifierSchema,{strict:true});

// export const queryOrchestratorLlmSchema = z.object({
//   currentStepIndex: z
//     .number()
//     .describe(
//       "decide which step must do now like do current step again or next "
//     ),
//   routeDecision: z
//     .enum([
//       "generateSchema",
//       "generateQuery",
//       "executeQuery",
//       "validator",
//       "summarizeOutput",
//       "generalChat",
//       "complexQueryApproval",
//       "queryPlanner",
//       "__end__",
//     ])
//     .describe("Decide which node to go by settign its name"),
//   retryCount: z
//     .number()
//     .describe(
//       "set retrycoutn to 0 if previous errors got resolve or its a new conversation. otherwise set as it is"
//     ),
//   needsReplanning: z
//     .boolean()
//     .default(false)
//     .describe(
//       "set to true if given plan by planner node is not good or effcient and route to planner node "
//     )
//     .optional(),
//   feedback: z
//     .string()
//     .describe(
//       "give feedback to the next nodes if needed to make better result otherwise make it empty"
//     )
//     ,
// });
// export const queryOrchestratorLlm =new ChatGroq({
//   model: "llama-3.3-70b-versatile",
//   apiKey: process.env.GROQ_API_KEY,
//   temperature: 0,
//    streaming: false,
// }
// // export const queryOrchestratorLlm = new ChatOpenAI({
// //   model: "openai/gpt-5.1-chat",
// //   apiKey: process.env.OPENAI_API_KEY,
// //   temperature: 0,
// //    streaming: false,
// //    maxTokens:3000,
// //    configuration:{
// //       baseURL:"https://openrouter.ai/api/v1",
      
// //    }
// // }
// ).withStructuredOutput(queryOrchestratorLlmSchema);





import { ChatMistralAI } from "@langchain/mistralai";


// ----------------------------------------
// Query Planner
// ----------------------------------------
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

export const queryPlannerLlm = new ChatMistralAI({
  model: "mistral-large-latest",
  apiKey: process.env.MISTRAL_API_KEY,
  temperature: 0,
  streaming: false,
}).withStructuredOutput(queryPlannerLlmSchema);




// ----------------------------------------
// Orchestrator
// ----------------------------------------
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
      "set retrycount to 0 if previous errors got resolve or its a new conversation. otherwise set as it is"
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
    ),
});

export const queryOrchestratorLlm = new ChatMistralAI({
  model: "mistral-large-latest",
  apiKey: process.env.MISTRAL_API_KEY,
  temperature: 0,
  streaming: false,
}).withStructuredOutput(queryOrchestratorLlmSchema);



const queryGeneratorLlmSchema = z.object({
  query: z
    .string()
    .describe(
      "This will hold query that can be executed on database without any extra steps"
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

// ----------------------------------------
// Query Generator (Mistral)
// ----------------------------------------
export const queryGeneratorLlm = new ChatMistralAI({
  model: "mistral-large-latest",
  apiKey: process.env.MISTRAL_API_KEY,
  temperature: 0.3,
}).withStructuredOutput(queryGeneratorLlmSchema);

// ----------------------------------------
// Summarizer (Mistral)
// ----------------------------------------
export const queryAnswerSummarizerLlm = new ChatMistralAI({
  model: "mistral-medium-latest",
  apiKey: process.env.MISTRAL_API_KEY,
  temperature: 0.3,
}).withStructuredOutput(summarizerLlmSchema);

// ----------------------------------------
// Chart Generator (text only — no structured output)
// ----------------------------------------
export const chartGeneratorLlm = new ChatMistralAI({
  model: "mistral-large-latest",
  apiKey: process.env.MISTRAL_API_KEY,
  temperature: 0,
});



// ----------------------------------------
// General Chat Model
// ----------------------------------------
export const generalChatLlm = new ChatMistralAI({
  model: "mistral-large-latest",
  apiKey: process.env.MISTRAL_API_KEY,
  temperature: 0,
});

// ----------------------------------------
// Validator Model
// ----------------------------------------
export const validatorLlmSchema = z.object({
  feedback: z.string().describe("Feedback for orchestrator or generateQuery"),
  routeDecision: z
    .enum(["orchestrator", "generateQuery"])
    .default("orchestrator"),
});

export const validatorLlm = new ChatMistralAI({
  model: "mistral-medium-latest",
  apiKey: process.env.MISTRAL_API_KEY,
  temperature: 0,
  streaming: false,
}).withStructuredOutput(validatorLlmSchema);

// ----------------------------------------
// Query Clarifier
// ----------------------------------------
export const queryClarifierSchema = z.object({
  message: z.string().describe("message give to the user for clarification"),
});

export const queryClarifierLlm = new ChatMistralAI({
  model: "mistral-large-latest",
  apiKey: process.env.MISTRAL_API_KEY,
  temperature: 0,
  streaming: false,
}).withStructuredOutput(queryClarifierSchema);

