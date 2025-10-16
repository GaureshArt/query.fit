import { cn } from "@/lib/utils";

interface IHeroHeadingProps {
  className?: string;
}
export default function HeroHeading({ className }: IHeroHeadingProps) {
  return (
    <div className={cn("px-4 py-10  ", className)}>
      <h1
        className={cn(
          "text-foreground text-6xl/snug text-center font-semibold"
        )}
      >
        The 
        <span className={cn(
            "inline-block px-4 py-1 mb-2 border-2 border-dashed   items-center-safe rounded-md   mx-2 -rotate-8 "
        )}>answers</span>
         are in your data. Just ask.
      </h1>
    </div>
  );
}
