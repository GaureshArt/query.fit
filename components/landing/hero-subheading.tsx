import { cn } from "@/lib/utils";

interface IHeroSubheadingProps {
  className?: string;
  text?: string;
}
export default function HeroSubheading({
  className,
  text,
}: IHeroSubheadingProps) {
  return (
    <div className={cn("px-4 -py-4 -mt-8", className)}>
      <h2 className={cn("font-light text-md text-center text-foreground")}>
        {text}
      </h2>
    </div>
  );
}
