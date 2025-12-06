import { MemorySaver, StateGraph } from "@langchain/langgraph";
import { GraphState, graphState } from "./state";
import {
  complexQueryApproval,
  executeQuery,
  generalChat,
  generateChartData,
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
  .addNode("generateChart", generateChartData)
  .addNode("queryClarifier", queryClarifier)
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
      generateChart:"generateChart",
      generateSchema: "generateSchema",
      generateQuery: "generateQuery",
      queryClarifier: "queryClarifier",
      executeQuery: "executeQuery",
      summarizeOutput: "summarizeOutput",
      complexQueryApproval: "complexQueryApproval",
      queryPlanner: "queryPlanner",
      generalChat: "generalChat",
      validator: "validator",
      orchestrator: "orchestrator", 
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
  .addEdge("generateChart","orchestrator")
  .addEdge("generalChat","__end__")
  .addEdge("queryClarifier","__end__")
  .addConditionalEdges("validator",(state:GraphState)=>state.routeDecision ?? "orchestrator",{
    orchestrator:"orchestrator",
    generateQuery:"generateQuery"
  })
  .compile({ checkpointer ,name:"QueryFit"});

export default QueryFitAgent;


