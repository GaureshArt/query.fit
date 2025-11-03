import { cn } from "@/lib/utils";
import PromptInput from "./prompt-input";

export default function QueryInterface() {
  return (
    <>
      <div className="flex flex-col justify-center w-full md:w-4/5   border-zinc-300 ">
        <div className="w-full mx-auto overflow-y-auto border border-zinc-300">
          <div className="md:p-4 space-y-3">
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={i} className="bg-white p-2 rounded shadow-sm">
                Message {i + 1}
              </div>
            ))}
          </div>
        </div>
        <div
          className={cn(
            "w-full bg-background flex justify-center sticky  bottom-0"
          )}
        >
          <PromptInput />
        </div>
      </div>
    </>
  );
}
