import { MemorySaver, StateGraph } from "@langchain/langgraph";
import { GraphState, graphState } from "./state";
import {
  checkSchema,
  complexQueryApproval,
  executeQuery,
  generateQuery,
  generateSchema,
  intentEvaluator,
} from "./nodes";


const checkpointer = new MemorySaver()

const  QueryFitAgent = new StateGraph(graphState)
  .addNode("intentEvaluator", intentEvaluator)
  .addNode("checkSchema", checkSchema)
  .addNode("generateSchema", generateSchema)
  .addNode("generateQuery", generateQuery)
  .addNode("executeQuery", executeQuery)
  .addNode("complexQueryApproval", complexQueryApproval, {
    ends: ["checkSchema", "__end__"],
  })
  .addEdge("__start__", "intentEvaluator")
  .addConditionalEdges(
    "intentEvaluator",
    (state: GraphState) => {
      return state.routeDecision ?? "__end__";
    },
    {
      checkSchema: "checkSchema",
      complexQueryApproval: "complexQueryApproval",
      __end__: "__end__",
    }
  )
  .addConditionalEdges(
    "checkSchema",
    (state: GraphState) => state.routeDecision ?? "__end__",
    {
      generateSchema: "generateSchema",
      generateQuery: "generateQuery",
      __end__: "__end__",
    }
  )
  .addEdge("generateSchema", "generateQuery")
  .addConditionalEdges(
    "generateQuery",
    (state: GraphState) => state.routeDecision ?? "__end__",
    {
      executeQuery: "executeQuery",
      __end__: "__end__",
    }
  )
  .addEdge("executeQuery","__end__")
  .compile({checkpointer})


  export default QueryFitAgent;