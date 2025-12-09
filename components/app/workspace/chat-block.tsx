import { Message, MessageContent } from "@/components/ai-elements/message";
import { cn } from "@/lib/utils";
import { BaseMessage } from "@langchain/core/messages";
export interface IChatBlockProps {
  messages: BaseMessage[];
}
export default function ChatBlock({ messages }: IChatBlockProps) {
  return (
    <>
      {messages &&
        messages.map((message, index) => {
          return (
            <Message
              className=" mb-2"
              from={message.type === "human" ? "user" : "assistant"}
              key={index}
            >
              <MessageContent className={cn("")}>
                  {typeof message.content === "string"
                    ? message.content
                    : message.content.map((m) => m.text).join(" ")}
              </MessageContent>
              
            </Message>
          );
        })}
    </>
  );
}
