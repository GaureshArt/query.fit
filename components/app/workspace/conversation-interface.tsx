import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { cn } from "@/lib/utils";
import { GraphState } from "@/utils/agent/state";
import { Interrupt } from "@langchain/langgraph";
import EmptyStateChatInterface from "./empty-state-chat-interface";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { Response } from "@/components/ai-elements/response";

import { ShimmeringText } from "@/components/external-ui/shimmering-text";
import { DynamicTable } from "./dynamic-table";
import { Spinner } from "@/components/ui/spinner";
import GenerativeUi from "@/utils/agent/ui";
import QueryApproveInterrupt from "./query-approve-interrupt";
import { CodeBlock, CodeBlockCopyButton} from "@/components/ai-elements/code-block";
interface IConversationInterfaceProps {
  state: GraphState;
  isLoading: boolean;
  interrupt: Interrupt<{ id: string; value: string }> | undefined;
  submit: () => void;
  disapproveSubmit: () => void;
  name: string;
  editQuerySubmit:(newSql:string)=>void;
}
export default function ConversationInterface({
  state,
  isLoading,
  interrupt,
  name,
  submit,
  disapproveSubmit,
  editQuerySubmit
}: IConversationInterfaceProps) {
  return (
    <>
      <Conversation>
        <ConversationContent className="w-auto max-w-full">
          {!state.messages ? (
            <ConversationEmptyState
              children={<EmptyStateChatInterface username={name} />}
            />
          ) : (
            <>
              {state.messages &&
                state.messages.map((message, index) => {
                  const metaData = message.response_metadata as {
                    tags: string[];
                  };
                  return (metaData.tags?.length &&
                    metaData.tags.includes("final_response")) ||
                    message.type === "human" ? (
                    <Message
                      className=" mb-2"
                      from={message.type === "human" ? "user" : "assistant"}
                      key={index}
                    >
                      <MessageContent className={cn("")}>
                        {message.type === "ai" || message.type === "human" ? (
                          <Response
                            className={cn(
                              message.type === "human" ? "bg-black" : ""
                            )}
                          >
                            {typeof message.content === "string"
                              ? message.content
                              : message.content.map((part) =>
                                  part.type === "text" ? part.text :""
                                )}
                          </Response>
                        ) : (
                          ""
                        )}
                      </MessageContent>
                    </Message>
                  ) : (
                    ""
                  );
                })}

              {isLoading ? (
                <div className="flex gap-5 items-center ">
                  <Spinner />{" "}
                  <ShimmeringText
                    className="inline-block"
                    text={
                      state.queryPlan?.steps[state.currentStepIndex]
                        ?.ui_message ?? "QueryFit is Thinking"
                    }
                  />
                </div>
              ) : (
                ""
              )}

              {state.ui?.config.type &&
                GenerativeUi[state.ui.config.type]({
                  chartData: state.ui.data,
                  config: state.ui.config,
                })}
              {interrupt && (
                <QueryApproveInterrupt
                  value={interrupt.value?.value ?? "Updating value"}
                  approveSubmit={submit}
                  disapproveSubmit={disapproveSubmit}
                />
              )}

            {state.queryResult && state.sqlQuery && (
  <Message from="queryresult" className="border rounded-md border-zinc-200">
    <MessageContent className="w-full">
      <div className={cn("border border-zinc-800 rounded-sm px-2 py-1 min-h-20")}>
        
        
        <CodeBlock
          code={state.sqlQuery}
          language="sql"
          className="border-none"
          onEdit={(newSql) => {
           editQuerySubmit(newSql)
  
          }}
        >
          <CodeBlockCopyButton
            onCopy={() => console.log("Copied code to clipboard")}
            onError={() => console.error("Failed to copy code to clipboard")}
          />
        </CodeBlock>

      </div>
      <p className="font-semibold">Query Result:</p>
      <div className="w-full [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {
          state.queryResult && state.queryResult instanceof Array && <DynamicTable data={state.queryResult} />
        }
      </div>
    </MessageContent>
  </Message>
)}

              {state.queryPlan && (
                <Message from="assistant" className=" overflow-auto">
                  <MessageContent className=" w-full">
                    <p className="font-semibold ">Query Result:</p>

                    <Response>{JSON.stringify(state.queryPlan)}</Response>
                  </MessageContent>
                </Message>
              )}
            </>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
    </>
  );
}
