import * as z from "zod"
import {BaseMessage} from "@langchain/core/messages"
import { registry } from "@langchain/langgraph/zod"
import { queryPlannerLlmSchema } from "./models";
export const graphState = z.object({
    messages:z.array(z.custom<BaseMessage>()).register(registry,{
       reducer:{
            fn:(a:BaseMessage[],b:BaseMessage[])=>a.concat(b)
        },
        default:()=>[] as BaseMessage[]
    }),
    dbId:z.string(),
    schema: z.string().optional(),
    sqlQuery: z.string().optional(),
    queryResult: z.any().optional(),
    currentStepIndex:z.number().default(0),
    routeDecision:z.string().optional(),
    lastError:z.string().optional(),
    retryCount:z.number().default(0),
    needsReplanning: z.boolean().default(false),
    chartSpec:z.any().optional(),
    answeredQuery:z.boolean().optional(),
    queryPlan:z.custom<z.infer<typeof queryPlannerLlmSchema>>().optional()
})

export type GraphState = z.infer<typeof graphState>;



