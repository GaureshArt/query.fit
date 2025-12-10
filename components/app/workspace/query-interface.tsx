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
import { useEffect, useState, useRef } from "react";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  CodeBlock,
  CodeBlockCopyButton,
} from "@/components/ai-elements/code-block";
import BackBtnSvg from "@/public/app-svgs/back-btn-svg";
import { Button } from "@/components/ui/button";
import { DynamicTable } from "./dynamic-table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Database, BarChart3 } from "lucide-react";

export default function QueryInterface() {
  const searchParams = useSearchParams();
  const { setDbid } = useUserInfo();
  const sessionId = searchParams.get("session-id");
  const { name: userName } = useUserInfo();

  const [isQueryPanelOpen, setIsQueryPanelOpen] = useState(false);
  const [isChartPanelOpen, setIsChartPanelOpen] = useState(false);

  const thread = useStream<
    GraphState,
    { InterruptType: { id: string; value: string } }
  >({
    apiUrl: "http://localhost:2024",
    assistantId: "agent",
    messagesKey: "messages",
  });

  const { open: isSidebarOpen } = useSidebar();
  const [showQuery, setShowQuery] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (thread.values.queryResult) setIsQueryPanelOpen(true);
  }, [thread.values.queryResult]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [thread.messages, isQueryPanelOpen, isChartPanelOpen]);

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
            <Collapsible
              open={isQueryPanelOpen}
              onOpenChange={setIsQueryPanelOpen}
              className="border-b border-zinc-100"
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full flex justify-between h-8 px-4 text-xs font-semibold bg-purple-50 hover:bg-purple-100"
                >
                  <span className="flex items-center gap-2">
                    <Database className="w-3 h-3" /> Query Result
                  </span>
                  {isQueryPanelOpen ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronUp className="w-3 h-3" />
                  )}
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="max-h-[40vh] overflow-y-auto bg-purple-100 p-2 border-b">
                <Message
                  from="queryresult"
                  className="border rounded-md border-zinc-200 bg-white"
                >
                  <MessageContent className="w-full">
                    {showQuery ? (
                      <div
                        className={cn(
                          "border border-zinc-800 rounded-sm px-2 py-1 min-h-20 text-wrap w-3/4 "
                        )}
                      >
                        <CodeBlock
                          code={thread.values.sqlQuery}
                          language="sql"
                          className=" text-wrap "
                          onEdit={(sqlQuery: string) => {
                            thread.submit({
                              messages: [
                                new HumanMessage(
                                  `Execute this query so dont go to the generate node go directly execute node . sql query: ${sqlQuery}`
                                ),
                              ],
                              sqlQuery,
                              feedback:
                                "Go directly to the execute query node.",
                            });
                          }}
                        >
                          <CodeBlockCopyButton
                            onCopy={() =>
                              console.log("Copied code to clipboard")
                            }
                            onError={() =>
                              console.error("Failed to copy code to clipboard")
                            }
                          />
                          <div onClick={() => setShowQuery(false)}>
                            <BackBtnSvg />
                          </div>
                        </CodeBlock>
                      </div>
                    ) : (
                      <Button
                        className={cn(
                          "w-40 font-bold text-lg rounded-sm cursor-pointer"
                        )}
                        variant={"outline"}
                        onClick={() => setShowQuery(true)}
                      >
                        Show Query
                      </Button>
                    )}
                    <p className="font-semibold mt-2">Query Result:</p>
                    <div className="w-full [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      {thread.values.queryResult &&
                        thread.values.queryResult instanceof Array && (
                          <DynamicTable data={thread.values.queryResult} />
                        )}
                    </div>
                  </MessageContent>
                </Message>
              </CollapsibleContent>
            </Collapsible>
          )}

          <Collapsible
            open={isChartPanelOpen}
            onOpenChange={setIsChartPanelOpen}
            className="border-b border-zinc-100"
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full flex justify-between h-8 px-4 text-xs font-semibold bg-orange-50 hover:bg-orange-100"
              >
                <span className="flex items-center gap-2">
                  <BarChart3 className="w-3 h-3" /> Chart Result
                </span>
                {isChartPanelOpen ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronUp className="w-3 h-3" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="h-64 bg-white p-4 flex items-center justify-center border-t">
              <div className="text-zinc-400 text-sm">
                [ Chart Component Placeholder ]
              </div>
            </CollapsibleContent>
          </Collapsible>
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
