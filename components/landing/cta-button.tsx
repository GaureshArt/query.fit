import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

import BorderPlusUi from "../shared/border-plus-ui";

import { JSX } from "react";
interface ICtaButtonProps {
  className?: string;
  text?: string;
  iconSvg: JSX.Element | null;
  clickFunc: () => Promise<void>;
}

export default function CtaButton({
  className,
  text,
  iconSvg,
  clickFunc,
}: ICtaButtonProps) {
  return (
    <div className={cn("flex justify-center items-center gap-2", className)}>
      <Button
        variant={"outline"}
        onClick={clickFunc}
        className={cn(
          "group px-2 py-1 cursor-pointer border-0  font-semibold  relative"
        )}
      >
        {iconSvg}
        <BorderPlusUi />
        {text}
      </Button>
    </div>
  );
}
