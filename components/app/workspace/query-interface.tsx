"use client";

import {
  typedUi,
  uiMessageReducer,
} from "@langchain/langgraph-sdk/react-ui/server";
import {
  LoadExternalComponent,
  useStreamContext,
} from "@langchain/langgraph-sdk/react-ui";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import PromptSendSvg from "@/public/app-svgs/prompt-send-svg";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Toaster } from "sonner";
import * as z from "zod";

import { useStream } from "@langchain/langgraph-sdk/react";
import { GraphState } from "@/utils/agent/state";
import { BaseMessage, HumanMessage } from "@langchain/core/messages";
import { useSearchParams } from "next/navigation";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { MessageSquareIcon } from "lucide-react";
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/components/ai-elements/message";
import { Spinner } from "@/components/ui/spinner";
import { DynamicTable } from "./dynamic-table";
import { useSidebar } from "@/components/ui/sidebar";
import { Response } from "@/components/ai-elements/response";

import {
  SlideToUnlock,
  SlideToUnlockHandle,
  SlideToUnlockText,
  SlideToUnlockTrack,
} from "@/components/external-ui/slide-to-unlock";
import { ShimmeringText } from "@/components/external-ui/shimmering-text";
import EmptyStateChatInterface from "./empty-state-chat-interface";
import { useUserInfo } from "@/lib/user-store";


const formSchema = z.object({
  query: z.string().min(3, "Please enter proper query. At least 3 characters"),
});

export default function QueryInterface() {

  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session-id");
  const {name:userName} = useUserInfo()
  const thread = useStream<GraphState>({
    apiUrl: "http://localhost:2024",
    assistantId: "agent",
    messagesKey: "messages",
  });

  const { open: isSidebarOpen } = useSidebar();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: "",
    },
  });

  if (!sessionId) {
    return <div>Session id is missing . First upload file and try again</div>;
  }

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    thread.submit({
      messages: [new HumanMessage(data.query)] ,
      dbId: sessionId,
    });
    form.reset();
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
          <Conversation>
            <ConversationContent className="w-auto max-w-full">
              {thread.messages && thread.messages.length === 0 ? (
                <ConversationEmptyState
                  children={<EmptyStateChatInterface username={userName}/>}
                />
              ) : (
                <>
                  {thread.messages &&
                    thread.messages.map((message, index) =>{

                        const metaData = message.response_metadata as {
                        tags:string[]
                      }
                    return ((( metaData.tags?.length && metaData.tags.includes("final_response"))  || (message.type==="human")) ? 
                      <Message
                        className=" mb-2"
                        from={message.type === "human" ? "user" : "assistant"}
                        key={index}
                      >
                        <MessageContent className={cn("")}>
                          {message.type === "ai" || message.type === "human" ? (
                            <Response className={cn(message.type === "human" ? "bg-black":"")}>
                              {typeof message.content === "string"
                                ? message.content
                                : message.content.map((part) =>
                                    part.type === "text" ? part.text : ""
                                  )}
                            </Response>
                          ) : (
                            ""
                          )}
                        </MessageContent>
                      </Message>:""
                    )})}

                  {
                    thread.isLoading ? <div className="flex gap-5 items-center "><Spinner /> <ShimmeringText className="inline-block" text={thread.values.queryPlan?.steps[thread.values.currentStepIndex]?.ui_message ?? "QueryFit is Thinking"}/></div>:""
                  }
                  {thread.interrupt && (
                    <div className="w-full px-4 py-2 border rounded-md text-red-400 font-bold">
                      {thread.interrupt.value as string}
                      <div className="flex gap-4">
                        <SlideToUnlock
                          className=" w-70 h-10 rounded-md"
                          onUnlock={() => {
                            thread.submit(undefined, {
                              command: { resume: { shouldContinue: true } },
                            });
                          }}
                        >
                          <SlideToUnlockTrack className="">
                            <SlideToUnlockText className=" ">
                              {({ isDragging }) => (
                                <ShimmeringText
                                  text="slide to confirm"
                                  isStopped={isDragging}
                                />
                              )}
                            </SlideToUnlockText>
                            <SlideToUnlockHandle className="h-8" />
                          </SlideToUnlockTrack>
                        </SlideToUnlock>
                        <Button
                          className={cn("font-semibold cursor-pointer")}
                          variant={"secondary"}
                          onClick={() => {
                            thread.submit(undefined, {
                              command: { resume: { shouldContinue: false } },
                            });
                          }}
                        >
                          Stop
                        </Button>
                      </div>
                    </div>
                  )}

                  {thread.values.ui?.length ? (
                    <LoadExternalComponent
                      key={"weather"}
                      namespace="agent"
                      stream={thread}
                      fallback={<span>Nothing</span>}
                    />
                  ) : (
                    "NoUi"
                  )}

                  {thread.values.queryResult && (
                    <Message from="queryresult" className=" ">
                      <MessageContent className=" w-full">
                        <p className="font-semibold ">Query Result:</p>

                        <div className="w-full  [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                          <DynamicTable data={thread.values.queryResult} />
                        </div>
                      </MessageContent>
                    </Message>
                  )}

                  {thread.values.queryPlan && (
                    <Message from="assistant" className=" overflow-auto">
                      <MessageContent className=" w-full">
                        <p className="font-semibold ">Query Result:</p>

                        {/* <div className="w-full  [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"> */}
                        {/* <code> */}
                        <Response>
                          {JSON.stringify(thread.values.queryPlan)}
                        </Response>

                        {/* </code> */}
                        {/* </div> */}
                      </MessageContent>
                    </Message>
                  )}
                </>
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>
        </div>

        <div
          className={cn(
            " bg-background flex flex-col justify-center sticky items-center  bottom-0",
            isSidebarOpen ? "w-4/5" : "w-full"
          )}
        >
          <div
            className={cn(
              "w-full md:w-4/6   rounded-xl md:px-6 py-4",
              isSidebarOpen ? "md:w-4/6" : ""
            )}
          >
            <Toaster position="top-center" richColors />
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="relative w-full  border-none"
            >
              <Controller
                name="query"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                    <Textarea
                      {...field}
                      autoFocus
                      placeholder="Ask your database!"
                      className={cn(
                        "md:text-lg font-medium",
                        "shadow-[2px_2px_6px_3px_#f3f3f3ea]",
                        "h-24 resize-none overflow-y-auto bg-white border border-zinc-500  rounded-xl pr-12 px-4 py-2",
                        "focus-visible:ring-0 focus-visible:outline-none",
                        "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                      )}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          form.handleSubmit(onSubmit)();
                        }
                      }}
                    />
                  </Field>
                )}
              />

              <Button
                type="submit"
                className="absolute bottom-3 right-3 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer"
              >
                <PromptSendSvg />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
