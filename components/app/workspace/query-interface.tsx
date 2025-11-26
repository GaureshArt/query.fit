"use client";
import { cn } from "@/lib/utils";
import * as z from "zod";
import { useStream } from "@langchain/langgraph-sdk/react";
import { GraphState } from "@/utils/agent/state";
import { HumanMessage } from "@langchain/core/messages";
import { useSearchParams } from "next/navigation";
import { useSidebar } from "@/components/ui/sidebar";
import { useUserInfo } from "@/lib/user-store";
import ConversationInterface from "./conversation-interface";
import PromptInput, { formSchema } from "./prompt-input";

export default function QueryInterface() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session-id");
  const { name: userName } = useUserInfo();
  const thread = useStream<GraphState, { InterruptType: {id:string,value:string} }>({
    apiUrl: "http://localhost:2024",
    assistantId: "agent",
    messagesKey: "messages",
  });

  const { open: isSidebarOpen } = useSidebar();

  if (!sessionId) {
    return <div>Session id is missing . First upload file and try again</div>;
  }

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    thread.submit({
      messages: [new HumanMessage(data.query)],
      dbId: sessionId,
    });
  };
  return (
    <>
      <div
        className={cn(
          "flex flex-col justify-center w-full  md:w-4/5 border-zinc-300  ",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        )}
      >
        <div
          className={cn(
            " h-full max-w-full overflow-hidden",
            " py-2",
            isSidebarOpen ? "w-4/5" : "w-full",
            "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          )}
        >
          <ConversationInterface
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

         
        </div>

        <div
          className={cn(
            " bg-background flex flex-col justify-center sticky items-center  bottom-0",
            isSidebarOpen ? "w-4/5" : "w-full"
          )}
        >
          <PromptInput isSidebarOpen={isSidebarOpen} submit={onSubmit} />
        </div>
      </div>
    </>
  );
}
