import { Conversation, ConversationContent, ConversationEmptyState, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { cn } from "@/lib/utils";
import { GraphState } from "@/utils/agent/state";
import { Interrupt } from "@langchain/langgraph";
import EmptyStateChatInterface from "./empty-state-chat-interface";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { Response } from "@/components/ai-elements/response";
import { SlideToUnlock, SlideToUnlockHandle, SlideToUnlockText, SlideToUnlockTrack } from "@/components/external-ui/slide-to-unlock";
import { ShimmeringText } from "@/components/external-ui/shimmering-text";
import { Button } from "@/components/ui/button";
import { DynamicTable } from "./dynamic-table";
import { Spinner } from "@/components/ui/spinner";

interface IConversationInterfaceProps{
    state:GraphState,
    isLoading:boolean,
    interrupt: Interrupt<{id:string,value:string}> | undefined,
    submit:()=>void;
    disapproveSubmit:()=>void;
    name:string
}
export default function ConversationInterface({state,isLoading,interrupt,name,submit,disapproveSubmit}:IConversationInterfaceProps) {
    return (
        <>  
            <Conversation>
            <ConversationContent className="w-auto max-w-full">
              {!state.messages ? (
                <ConversationEmptyState
                  children={<EmptyStateChatInterface username={name}/>}
                />
              ) : (
                <>
                  {state.messages &&
                    state.messages.map((message, index) =>{

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
                    isLoading ? <div className="flex gap-5 items-center "><Spinner /> <ShimmeringText className="inline-block" text={state.queryPlan?.steps[state.currentStepIndex]?.ui_message ?? "QueryFit is Thinking"}/></div>:""
                  }
                  {interrupt && (
                    <div className="w-full px-4 py-2 border rounded-md text-red-400 font-bold">
                      interrupt: {interrupt.value?.value}
                      
                      <div className="flex gap-4">
                        <SlideToUnlock
                          className=" w-70 h-10 rounded-md"
                          onUnlock={submit}
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
                          onClick={disapproveSubmit}
                        >
                          Stop
                        </Button>
                      </div>
                    </div>
                  )}

                 
                  {state.queryResult && (
                    <Message from="queryresult" className=" ">
                      <MessageContent className=" w-full">
                        <p className="font-semibold ">Query Result:</p>

                        <div className="w-full  [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                          <DynamicTable data={state.queryResult} />
                        </div>
                      </MessageContent>
                    </Message>
                  )}

                  {state.queryPlan && (
                    <Message from="assistant" className=" overflow-auto">
                      <MessageContent className=" w-full">
                        <p className="font-semibold ">Query Result:</p>

                        <Response>
                          {JSON.stringify(state.queryPlan)}
                        </Response>

                      </MessageContent>
                    </Message>
                  )}
                </>
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

        </>
    )
}