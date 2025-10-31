"use client"
import { cn } from "@/lib/utils";
import { JSX } from "react";
import { Button } from "../ui/button";
import { redirect } from "next/navigation";
import BorderPlusUi from "../shared/border-plus-ui";

interface IWelcomeButtonProps {
  className?: string;
  text?: string;
  iconSvg:JSX.Element | null;

}

export default function WelcomeButton({className,text,iconSvg}:IWelcomeButtonProps){
    return (
 <div className={cn("flex justify-center items-center gap-2", className)}>
      <Button
        variant={"outline"}
        onClick={()=>redirect('/settings')}
        className={cn("group px-2 py-1 cursor-pointer border-0  font-semibold  relative")}
      >
       {iconSvg}
        <BorderPlusUi/>
        {text}
      </Button>
    </div>
    )
}