"use client";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { cn } from "@/lib/utils";
import { GraphState } from "@/utils/agent/state";
import { Interrupt, Messages } from "@langchain/langgraph";
import EmptyStateChatInterface from "./empty-state-chat-interface";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { Response } from "@/components/ai-elements/response";

import { ShimmeringText } from "@/components/external-ui/shimmering-text";
import { DynamicTable } from "./dynamic-table";
import { Spinner } from "@/components/ui/spinner";
import GenerativeUi, { IGenerativeUi } from "@/utils/agent/ui";
import QueryApproveInterrupt from "./query-approve-interrupt";
import {
  CodeBlock,
  CodeBlockCopyButton,
} from "@/components/ai-elements/code-block";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import BackBtnSvg from "@/public/app-svgs/back-btn-svg";
import {
  AIMessageChunk,
  BaseMessage,
  BaseMessageChunk,
} from "@langchain/core/messages";
import ChatBlock from "./chat-block";
import ChainOfThoughtQueryPlan from "./chain-of-thought-query-plan";
interface IConversationInterfaceProps {
  state: GraphState;
  messages: BaseMessage[];
  isLoading: boolean;
  interrupt: Interrupt<{ id: string; value: string }> | undefined;
  submit: () => void;
  disapproveSubmit: () => void;
  name: string;
  
}
export default function ConversationInterface({
  state,
  isLoading,
  interrupt,
  name,
  submit,

  disapproveSubmit,
  
}: IConversationInterfaceProps) {
  const ChartComponent = state.ui?.config?.type
    ? GenerativeUi[state.ui.config.type]
    : null;

  return (
    <>
      <Conversation>
        <ConversationContent className="w-auto max-w-full">
          {!state.messages?.length ? (
            <ConversationEmptyState
              children={<EmptyStateChatInterface username={name} />}
            />
          ) : (
            <>
              <ChatBlock messages={state.messages} />
              {isLoading?
                <>
                  {/* <div className="flex gap-5 items-center ">
                    <Spinner />
                    <ShimmeringText
                      className="inline-block"
                      text={
                        state.queryPlan?.steps[state.currentStepIndex]
                          ?.ui_message ?? "QueryFit is Thinking"
                      }
                    />
                  </div> */}
                  <div>
                    <ChainOfThoughtQueryPlan
                      currentStepIndex={state.currentStepIndex}
                      isThinking={isLoading}
                      plan={state.queryPlan}
                    />
                  </div>
                </>:""
              }

              {ChartComponent && (
                <ChartComponent
                  chartData={state.ui.data}
                  config={state.ui.config}
                />
              )}

              {interrupt && (
                <QueryApproveInterrupt
                  value={interrupt.value?.value ?? "Updating value"}
                  approveSubmit={submit}
                  disapproveSubmit={disapproveSubmit}
                />
              )}

              
            </>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
    </>
  );
}
