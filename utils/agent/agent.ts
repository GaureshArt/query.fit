import { MemorySaver, StateGraph } from "@langchain/langgraph";
import { GraphState, graphState } from "./state";
import {
  complexQueryApproval,
  executeQuery,
  generalChat,
  generateQuery,
  generateSchema,
  orchestrator,
  queryClarifier,
  queryPlanner,
  summarizeOutput,
  validator,
} from "./nodes";

const checkpointer = new MemorySaver();

const QueryFitAgent = new StateGraph(graphState)
  .addNode("queryPlanner", queryPlanner)
  .addNode("orchestrator", orchestrator)
  .addNode("validator", validator)
  .addNode("generalChat", generalChat)
  .addNode("queryClarifier", queryClarifier, {
    ends: ["generateQuery"],
  })
  .addNode("generateSchema", generateSchema)
  .addNode("generateQuery", generateQuery)
  .addNode("executeQuery", executeQuery)
  .addNode("summarizeOutput", summarizeOutput)
  .addNode("complexQueryApproval", complexQueryApproval, {
    ends: ["orchestrator"],
  })
  .addEdge("__start__", "queryPlanner")
  .addEdge("queryPlanner", "orchestrator")
  .addConditionalEdges(
    "orchestrator",
    (state: GraphState) => state.routeDecision ?? "orchestrator",
    {
      generateSchema: "generateSchema",
      generateQuery: "generateQuery",
      queryClarifier: "queryClarifier",
      executeQuery: "executeQuery",
      summarizeOutput: "summarizeOutput",
      complexQueryApproval: "complexQueryApproval",
      queryPlanner: "queryPlanner",
      generalChat: "generalChat",
      validator: "validator",
      orchestrator: "__end__", 
      __end__: "__end__",
    }
  )
  .addEdge("generateSchema","orchestrator")
  .addConditionalEdges("generateQuery",(state:GraphState)=>state.routeDecision ?? "validator",{
    validator:"validator",
    queryClarifier:"queryClarifier"
  })
  .addEdge("executeQuery","orchestrator")
  .addEdge("summarizeOutput","__end__")
  .addEdge("queryPlanner","orchestrator")
  .addEdge("generalChat","__end__")
  .addConditionalEdges("validator",(state:GraphState)=>state.routeDecision ?? "orchestrator",{
    orchestrator:"orchestrator",
    generateQuery:"generateQuery"
  })
  .compile({ checkpointer });

export default QueryFitAgent;
