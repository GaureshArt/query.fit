"use client";
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
import { thread } from "@/utils/agent/thread";
import { Response } from "@/components/ai-elements/response";

const formSchema = z.object({
  query: z.string().min(3, "Please enter proper query. At least 3 characters"),
});

export default function QueryInterface() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session-id");
  const { submit, values } = useStream<GraphState>({
    apiUrl: "http://localhost:2024",
    assistantId: "agent",
    messagesKey: "messages",
  });

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
    submit({
      messages: [{ type: "human", content: data.query }] as BaseMessage[],
      dbId: sessionId,
    });
    form.reset();
  };
  return (
    <>
      <div className="flex flex-col justify-center w-full md:w-4/5   border-zinc-300 ">
        <div className="w-full h-full overflow-y-auto border border-red-300">
          {values.messages?.map((message, ind) => (
            <div key={ind}>
              {
                <span className="bg-background p-2 rounded-full">
                  {message.type}
                </span>
              }
              <div className="px-2 py-1 bg-green-50 text-green-500 border border-green-600">
                <Response>{message.content as string}</Response>
              </div>
            </div>
          ))}
          {values.error && (
            <div className="border border-red-800 rounded px-2 py-1 bg-red-50 text-red-600">
              Erorr: {values.error}
            </div>
          )}
          {values.queryResult && (
            <div>
              queryResult:
              <div className="bg-orange-50 border border-orange-700 px-2 py-1 rounded text-orangeg-500">
                {JSON.stringify(values.queryResult)}
              </div>
            </div>
          )}
        </div>
        <div
          className={cn(
            "w-full bg-background flex justify-center sticky  bottom-0"
          )}
        >
          <div className={cn("w-full md:w-4/6   rounded-xl md:px-6 py-4")}>
            <Toaster position="top-center" richColors />
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="relative w-full border-none"
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
