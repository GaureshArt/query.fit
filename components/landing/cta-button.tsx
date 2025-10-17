import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import GoogleIconSvg from "@/public/landing/google-icon";
import BorderPlusUi from "../shared/border-plus-ui";
interface ICtaButtonProps {
  className?: string;
  text?: string;
}


export default function CtaButton({ className, text }: ICtaButtonProps) {
  return (
    <div className={cn("flex justify-center items-center gap-2", className)}>
      <Button
        variant={"outline"}
        className={cn("group px-2 py-1 cursor-pointer border-0  font-semibold  relative")}
      >
        <GoogleIconSvg />
        <BorderPlusUi/>
        {text}
      </Button>
    </div>
  );
}
