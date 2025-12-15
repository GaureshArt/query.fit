
import { SUGGESTION_PILLS } from "@/constants/suggestion-pills";
import { cn } from "@/lib/utils";
import EmptyChatSvg from "@/public/app-svgs/empty-chat-svg";
import { ArrowRight, Sparkles } from "lucide-react";
interface IEmptyStateChatInterfaceProps{
    username:string,
     submit: (data: { query: string }) => void;
}

export default  function EmptyStateChatInterface(props:IEmptyStateChatInterfaceProps) {

    return (
        <>
        <div>
            <EmptyChatSvg/>
        </div>
        <div className={cn("text-6xl font-bold")}>
            Hello, {props.username}. Let's Chat
        </div>
      <div className="w-full max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
      {SUGGESTION_PILLS.map((pill) => (
        <button
          key={pill.id}
          onClick={() => {
           props.submit({query:pill.question})
          }}
          className={cn(
            "group relative flex flex-col items-start justify-between gap-4",
            "h-30 w-full rounded-2xl border border-neutral-200 bg-white p-5",
            "text-left shadow-sm transition-all duration-300 ease-out",
            "hover:border-neutral-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1",
            "dark:bg-neutral-900 dark:border-neutral-800 dark:hover:border-neutral-700"
          )}
        >
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center justify-center rounded-full bg-neutral-100 p-2 text-neutral-600 transition-colors group-hover:bg-black group-hover:text-white dark:bg-neutral-800 dark:text-neutral-400 dark:group-hover:bg-white dark:group-hover:text-black">
              <Sparkles className="h-4 w-4" strokeWidth={1} />
            </div>
            
            <ArrowRight className="h-4 w-4 text-neutral-300 opacity-0 transition-all duration-300 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0" />
          </div>

          <p className="font-medium text-neutral-700 dark:text-neutral-300 leading-snug">
            {pill.question}
          </p>
        </button>
      ))}
    </div>
        </>
    )
}