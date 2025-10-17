import { cn } from "@/lib/utils";

interface IEyebrowProps {
  className?: string;
  text?: string;
}

export default function Eyebrow({ text, className }: IEyebrowProps) {
  return (
    <div
      className={cn("flex justify-center-safe items-center-safe ", className)}
    >
      <h1 className="sr-only">Eyebrow Content - {text}</h1>

      <div
        className={cn(
          "min-w-1/3 h-1/2 px-4 py-1 text-md  font-cutive-mono tracking-tighter text-shadow-2xs text-foreground  border rounded-md border-white/20   flex items-center-safe justify-center gap-4 "
        )}
      >
        <span
          className={cn(
            "w-2 h-2  rounded-full  bg-ring shadow-[0px_0px_5px_5px_#58b862ea]"
          )}
        ></span>
        {text}
      </div>
    </div>
  );
}
