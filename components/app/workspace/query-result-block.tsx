import { CodeBlock, CodeBlockCopyButton } from "@/components/ai-elements/code-block";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import BackBtnSvg from "@/public/app-svgs/back-btn-svg";
import { HumanMessage } from "@langchain/core/messages";
import { ChevronDown, ChevronUp, Database } from "lucide-react";
import { DynamicTable } from "./dynamic-table";
import { useState } from "react";


export interface IQueryResultBlockProps{
    sqlQuery:string;
    queryResult:[] | undefined;
    editSumbit:(sqlQuery:string)=>void;
}
export default function QueryResultBlock({sqlQuery,queryResult,editSumbit}:IQueryResultBlockProps) {

    const [isQueryPanelOpen, setIsQueryPanelOpen] = useState<boolean>(false);
    const [showQuery, setShowQuery] = useState<boolean>(false);
    return (
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
                          code={sqlQuery ?? ""}
                          language="sql"
                          onEdit={()=>editSumbit(sqlQuery)}
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
                      {queryResult &&
                        queryResult instanceof Array && (
                          <DynamicTable data={queryResult} />
                        )}
                    </div>
                  </MessageContent>
                </Message>
              </CollapsibleContent>
            </Collapsible>
    )
}