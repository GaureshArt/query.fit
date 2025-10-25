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
          "font-cutive-mono text-zinc-900/80 font-bold text-sm",
          "border-2  py-1 px-4 border-zinc-700 border-dashed"
        )}
      >
        <span
          className={cn("w-2 h-2 rounded-full bg-zinc-900  animate-pulse")}
        ></span>
        {text}
        
      </div>
    </div>
  );
}
