import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import GoogleIconSvg from "@/public/landing/google-icon";
interface ICtaButtonProps {
  className?: string;
  text?: string;
}
export default function CtaButton({ className, text }: ICtaButtonProps) {
  return (
    <div className={cn("flex justify-center items-center gap-2", className)}>
      <Button
        variant={"outline"}
        className={cn("px-2 py-1 cursor-pointer border-dashed font-semibold hover:bg-accent")}
      >
        <GoogleIconSvg />
        {text}
      </Button>
    </div>
  );
}
