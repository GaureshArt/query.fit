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
  suggestPillSubmit: (data: { query: string }) => void;
  interrupt: Interrupt<{ id: string; value: string }> | undefined;
  submit: () => void;
  disapproveSubmit: () => void;
  name: string;
}
export default function ConversationInterface({
  state,
  isLoading,
  interrupt,
  suggestPillSubmit,
  name,
  submit,
  disapproveSubmit,
}: IConversationInterfaceProps) {
  return (
    <>
      <Conversation>
        <ConversationContent className="w-auto max-w-full">
          {!state.messages?.length ? (
            <ConversationEmptyState
              children={<EmptyStateChatInterface username={name} submit={suggestPillSubmit} />}
            />
          ) : (
            <>
              <ChatBlock messages={state.messages} />
              {isLoading ? (
                <>
                  <div>
                    <Spinner />
                    <ChainOfThoughtQueryPlan
                      currentStepIndex={state.currentStepIndex}
                      isThinking={isLoading}
                      plan={state.queryPlan}
                    />
                  </div>
                </>
              ) : (
                ""
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
