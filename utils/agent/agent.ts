import { MemorySaver, StateGraph } from "@langchain/langgraph";
import { GraphState, graphState } from "./state";
import {
  
  complexQueryApproval,
  executeQuery,
  generateQuery,
  generateSchema,
  
  queryPlanner,
  summarizeOutput,
} from "./nodes";


const checkpointer = new MemorySaver();

const QueryFitAgent = new StateGraph(graphState)
  .addNode("queryPlanner",queryPlanner)
  // .addNode("intentEvaluator", intentEvaluator)
  // .addNode("checkSchema", checkSchema)
  // .addNode("generateSchema", generateSchema)
  // .addNode("generateQuery", generateQuery)
  // .addNode("executeQuery", executeQuery)
  // .addNode("summarizeOutput", summarizeOutput)
  // .addNode("complexQueryApproval", complexQueryApproval, {
  //   ends: ["checkSchema", "__end__"],
  // })
  .addEdge("__start__", "queryPlanner")
  .addEdge("queryPlanner","__end__")
  // .addConditionalEdges(
  //   "intentEvaluator",
  //   (state: GraphState) => {
  //     return state.routeDecision ?? "__end__";
  //   },
  //   {
  //     checkSchema: "checkSchema",
  //     complexQueryApproval: "complexQueryApproval",
  //     __end__: "__end__",
  //   }
  // )
  // .addConditionalEdges(
  //   "checkSchema",
  //   (state: GraphState) => state.routeDecision ?? "__end__",
  //   {
  //     generateSchema: "generateSchema",
  //     generateQuery: "generateQuery",
  //     __end__: "__end__",
  //   }
  // )
  // .addEdge("generateSchema", "generateQuery")
  // .addConditionalEdges(
  //   "generateQuery",
  //   (state: GraphState) => state.routeDecision ?? "__end__",
  //   {
  //     executeQuery: "executeQuery",
  //     __end__: "__end__",
  //   }
  // )
  // .addEdge("executeQuery", "summarizeOutput")
  // .addEdge("summarizeOutput","__end__")
  .compile({ checkpointer});

export default QueryFitAgent;


