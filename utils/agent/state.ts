import * as z from "zod"
import {BaseMessage} from "@langchain/core/messages"
import { registry } from "@langchain/langgraph/zod"
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
})

export type GraphState = z.infer<typeof graphState>;
