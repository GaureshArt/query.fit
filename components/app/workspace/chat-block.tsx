import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
} from "@/components/ai-elements/message";
import { cn } from "@/lib/utils";
import { BaseMessage } from "@langchain/core/messages";
import { CopyIcon, } from "lucide-react";
import MarkdownRenderer from "./markdown-renderer";
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
              className={cn(" mb-2 flex flex-col",message.type==="human"?"":"items-start")}
              from={message.type === "human" ? "user" : "assistant"}
              key={index}
            >
              <MessageContent className={cn("")}>
                
                {typeof message.content === "string"
                  ? <MarkdownRenderer content={message.content}/>
                  :<MarkdownRenderer content={ message.content.map((m) => m.text).join(" ")}/>}
              </MessageContent>
              <MessageActions>
                <MessageAction
                  onClick={() =>
                    navigator.clipboard.writeText(message.content as string)
                  }
                  label="Copy"
                >
                  <CopyIcon className="size-3" />
                </MessageAction>
              </MessageActions>
            </Message>
          );
        })}
    </>
  );
}
