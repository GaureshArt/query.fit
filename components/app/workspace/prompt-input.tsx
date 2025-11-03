"use client";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import PromptSendSvg from "@/public/app-svgs/prompt-send-svg";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import * as z from "zod";

const formSchema = z.object({
  query: z.string().min(3, "Please enter proper query. At least 3 characters"),
});

export default function PromptInput() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: "",
    },
    
  reValidateMode: "onSubmit",
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log(data);
    toast.success(data.query);
    form.reset();

  };

  return (
    <>
      <div className={cn("w-full md:w-4/6   rounded-xl md:px-6 py-4")}>
        <Toaster position="top-center" richColors />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="relative w-full border-none"
        >
          <Controller
            name="query"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                {fieldState.error && (
                  <FieldError errors={[fieldState.error]} />
                )}
                <Textarea
                  {...field}
                  autoFocus
                  placeholder="Ask your database!"
                  className={cn(
                    "md:text-lg font-medium",
                    "shadow-[2px_2px_6px_3px_#f3f3f3ea]",
                    "h-24 resize-none overflow-y-auto bg-white border border-zinc-500  rounded-xl pr-12 px-4 py-2",
                    "focus-visible:ring-0 focus-visible:outline-none",
                    "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  )}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      form.handleSubmit(onSubmit)();
                    }
                  }}
                />
              </Field>
            )}
          />

          <Button
            type="submit"
            className="absolute bottom-3 right-3 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer"
          >
            <PromptSendSvg />
          </Button>
        </form>
      </div>
    </>
  );
}
