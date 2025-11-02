import { cn } from "@/lib/utils";

interface IHeroHeadingProps {
  className?: string,
  text:string
}
export default function HeroHeading({ className,text }: IHeroHeadingProps) {
  return (
    <div className={cn("px-4 py-2  ", className)}>
      <h1
        className={cn(
          "text-foreground text-[52px] text-center font-bold"
        )}
      >
        {text}
      
      </h1>
    </div>
  );
}
