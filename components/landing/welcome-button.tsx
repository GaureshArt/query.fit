"use client"
import { cn } from "@/lib/utils";
import { JSX } from "react";
import { Button } from "../ui/button";
import { redirect } from "next/navigation";
import BorderPlusUi from "../shared/border-plus-ui";
import { useUserInfo } from "@/lib/user-store";

interface IWelcomeButtonProps {
  className?: string;
  text?: string;
  iconSvg:JSX.Element | null;

}

export default function WelcomeButton({className,text,iconSvg}:IWelcomeButtonProps){

  const {setName} = useUserInfo()
    return (
 <div className={cn("flex justify-center items-center gap-2", className)}>
      <Button
        variant={"outline"}
        onClick={()=>{
          if(text)
            setName(text)
          redirect('/workspace/data-drop')}}
        className={cn("group px-2 py-1 cursor-pointer border-0  font-semibold  relative")}
      >
       {iconSvg}
        <BorderPlusUi/>
        Welcome {text}
      </Button>
    </div>
    )
}