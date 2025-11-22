
import { cn } from "@/lib/utils";
import EmptyChatSvg from "@/public/app-svgs/empty-chat-svg";
interface IEmptyStateChatInterfaceProps{
    username:string
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
        </>
    )
}