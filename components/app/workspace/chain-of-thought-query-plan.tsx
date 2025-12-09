"use client";
import { cn } from "@/lib/utils";

import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
} from "@/components/ai-elements/chain-of-thought";
import { 
  Database, 
  Code, 
  LayoutTemplate, 
  Play, 
  BarChart3, 
  FileText, 
  CheckCircle,
  BrainCircuit,
  MessageSquare
} from "lucide-react";
import { z } from "zod";
import { GraphState } from "@/utils/agent/state";



export const QueryPlan = z.object({
  reasoning: z
    .string()
    .describe(
      "Explain why you chose this specific plan and intent based on user context and tool availability."
    ),
  intent: z
    .enum([
      "general",
      "retrieval",
      "manipulation",
      "visualization",
      "multi-step",
    ])
    .describe(
      "Classify the user's intent. Use 'multi-step' if the request involves both chatting and database actions."
    ),
  steps: z.array(
    z.object({
      step_number: z.number().describe("The execution order number."),
      tool_name: z
        .enum([
          "generateSchema",
          "generateQuery",
          "queryPlanner",
          "executeQuery",
          "generateChart",
          "summarizeOutput",
          "generalChat",
          "complexQueryApproval",
        ])
        .describe("The specific tool from the registry to use."),
      description: z
        .string()
        .describe("Internal technical note on why this tool is used."),
      ui_message: z
        .string()
        .describe(
          "A user-friendly status message to display on the frontend (e.g., 'Scanning database structure...')."
        ),
    })
  ),
});


interface QueryExecutionProcessProps {
  plan: z.infer<typeof QueryPlan> | undefined;
  currentStepIndex: number; 
  isThinking?: boolean; 
}


const getIconForTool = (toolName: string) => {
  switch (toolName) {
    case "generateSchema":
      return Database; // Scanning DB
    case "generateQuery":
      return Code; // Writing SQL
    case "queryPlanner":
      return BrainCircuit; // Thinking
    case "executeQuery":
      return Play; // Running SQL
    case "generateChart":
      return BarChart3; // Visualizing
    case "summarizeOutput":
      return FileText; // Writing text
    case "generalChat":
      return MessageSquare; 
    case "complexQueryApproval":
      return CheckCircle;
    default:
      return LayoutTemplate;
  }
};
export default function ChainOfThoughtQueryPlan({
  plan, 
  currentStepIndex, 
  isThinking = false 
}: QueryExecutionProcessProps) {
  
  if (!isThinking) {
    return (
      <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground animate-pulse">
        <BrainCircuit className="h-4 w-4" />
        <span>Analyzing database structure and planning...</span>
      </div>
    );
  }

  if (!plan) return null;

  return (
    <ChainOfThought defaultOpen className="w-full max-w-2xl border rounded-xl bg-card px-4 py-2">
      <ChainOfThoughtHeader>
         <span className="font-semibold text-sm">
           Execution Plan ({plan.intent})
         </span>
      </ChainOfThoughtHeader>
      
      <ChainOfThoughtContent>
        
        <div className="px-4 pb-4 pt-2  text-muted-foreground  mb-2">
           <span className="font-semibold text-primary">Strategy:</span> {plan.reasoning}
        </div>

        {plan.steps.map((step, index) => {
          
          let status: "pending" | "active" | "complete" = "pending";
          
          if (index < currentStepIndex) {
            status = "complete";
          } else if (index === currentStepIndex) {
            status = "active";
          }

          return (
            <ChainOfThoughtStep
              key={step.step_number}
              icon={getIconForTool(step.tool_name)}
              label={step.ui_message}
              description={status === "active" || status === "complete" ? step.description : undefined}
              status={status}
            />
          );
        })}
      </ChainOfThoughtContent>
    </ChainOfThought>

    )
}