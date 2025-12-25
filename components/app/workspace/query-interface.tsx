"use client";
import { cn } from "@/lib/utils";
import * as z from "zod";
import { useStream } from "@langchain/langgraph-sdk/react";
import { GraphState } from "@/utils/agent/state";
import { BaseMessage, HumanMessage } from "@langchain/core/messages";
import { useSearchParams } from "next/navigation";
import { useSidebar } from "@/components/ui/sidebar";
import { useUserInfo } from "@/lib/user-store";
import ConversationInterface from "./conversation-interface";
import PromptInput, { formSchema } from "./prompt-input";
import { toast, Toaster } from "sonner";
import { useEffect, useRef } from "react";

import ChartBlock from "./chart-block";
import QueryResultBlock from "./query-result-block";
import { client, thread as _thread  } from "@/utils/agent/thread";

export default function QueryInterface() {
  const searchParams = useSearchParams();
  const { setDbid } = useUserInfo();
  const sessionId = searchParams.get("session-id");
  const { name: userName } = useUserInfo();

  const thread = useStream<
    GraphState,
    { InterruptType: { id: string; value: string } }
  >({
    apiUrl: "http://localhost:2024",
    assistantId: "agent",
    messagesKey: "messages",
    
  });
  const { open: isSidebarOpen } = useSidebar();
  const scrollRef = useRef<HTMLDivElement>(null);
  // useEffect(() => {
  //   if (scrollRef.current) {
  //     scrollRef.current.scrollIntoView({ behavior: "smooth" });
  //   }
  // }, [thread.messages]);

  useEffect(() => {
    if (sessionId) {
      setDbid(sessionId);
    }
  }, [sessionId]);

  if (!sessionId) {
    return <div>Session id is missing . First upload file and try again</div>;
  }
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (!data.query.trim()) {
      toast.error("Enter valid query");
      return;
    }

    thread.submit({
      messages: [
        new HumanMessage({
          content: data.query,
          additional_kwargs: {
            node: "general_chat",
          },
        }),
      ],
      queryResult: undefined,
      currentStepIndex: 0,
      queryPlan: undefined,
      sqlQuery: "",
      dbId: sessionId,
    });
  };

  return (
    <>
      <Toaster />

      <div
        className={cn(
          "flex flex-col h-screen w-full md:w-4/5 border-zinc-300 relative  overflow-hidden"
        )}
      >
        <div
          className={cn(
            "flex-1 min-h-0 overflow-y-auto py-2 scroll-smooth",
            isSidebarOpen ? "w-4/5" : "w-full",
            "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          )}
        >
          <ConversationInterface
          suggestPillSubmit={onSubmit}
            messages={thread.messages as BaseMessage[]}
            state={thread.values}
            isLoading={thread.isLoading}
            interrupt={thread.interrupt}
            name={userName}
            submit={() => {
              thread.submit(undefined, {
                command: { resume: { shouldContinue: true } },
              });
            }}
            disapproveSubmit={() => {
              thread.submit(undefined, {
                command: { resume: { shouldContinue: false } },
              });
            }}
          />

          <div ref={scrollRef} className="h-4" />
        </div>

        <div
          className={cn(
            "bg-background border-t border-zinc-200 shrink-0 z-10",
            isSidebarOpen ? "w-4/5" : "w-full"
          )}
        >
          {thread.values.queryResult && thread.values.sqlQuery && (
            <QueryResultBlock
              sqlQuery={thread.values.sqlQuery}
              queryResult={thread.values.queryResult}
              editSumbit={(sqlQuery: string) => {
                thread.submit({
                  messages: [
                    new HumanMessage(
                      `Execute this query so dont go to the generate node go directly execute node . sql query: ${sqlQuery}`
                    ),
                  ],
                  sqlQuery,
                  feedback: "Go directly to the execute query node.",
                });
              }}
            />
          )}
          {thread.values.ui && (
            <ChartBlock
              chartConfig={thread.values.ui.config}
              chartData={thread.values.ui.data}
            />
          )}
        </div>
        <div
          className={cn(
            "bg-background flex flex-col justify-center items-center shrink-0 z-20 pb-4 pt-2",
            isSidebarOpen ? "w-4/5" : "w-full"
          )}
        >
          <PromptInput
            isSidebarOpen={isSidebarOpen}
            submit={onSubmit}
            stop={thread.stop}
            isLoading={thread.isLoading}
          />
        </div>
      </div>
    </>
  );
}
