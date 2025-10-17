import { cn } from "@/lib/utils";


interface IEyebrowProps {
  className?: string;
  text?: string;
}

export default function Eyebrow({ text, className }: IEyebrowProps) {
  return (
    <div className={cn("flex justify-center items-center", className)}>
      <h1 className="sr-only">Eyebrow Content - {text}</h1>

      <div
        className={cn(
          "flex items-center justify-center gap-3",
          "px-4 py-1.5",
          "font-cutive-mono tracking-wide text-foreground text-sm",
          "border border-y-0  border-neutral-700",
          "rounded-sm"
        )}
      >
        <span
          className={cn("w-2 h-2 rounded-full bg-green-500 animate-pulse")}
        ></span>
        {text}
        
      </div>
    </div>
  );
}
