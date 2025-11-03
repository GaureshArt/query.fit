"use client";

import { cn } from "@/lib/utils";
import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PlusSvg from "@/components/shared/plus-svg";
import UploadFileSvg from "@/public/app-svgs/upload-file-svg";
import { useMutation } from "@tanstack/react-query";
import { toast, Toaster } from "sonner";

import { Spinner } from "@/components/ui/spinner";
import { useRef } from "react";
import {  useRouter } from "next/navigation";

export const uploadSchema = z.object({
  file: z
    .any()
    .refine((files) => files?.length === 1, "You must upload a file.")
    .refine(
      (files) => files?.[0]?.size <= 5 * 1024 * 1024,
      "File size must be less than 5MB."
    )
    .refine((files) => {
      if (!files?.[0]) return false;
      const fileName = files[0].name.toLowerCase();
      return (
        fileName.endsWith(".db") ||
        fileName.endsWith(".sqlite") ||
        fileName.endsWith(".csv")
      );
    }, "Only .db, .sqlite, or .csv files are allowed."),
});

export default function FileDrop() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const form = useForm<z.infer<typeof uploadSchema>>({
    resolver: zodResolver(uploadSchema),
  });

  const { mutate: uploadMutate, isPending } = useMutation({
    mutationFn: async (data: z.infer<typeof uploadSchema>) => {
      const formData = new FormData();
      const file = data.file[0];
      formData.append("file", file);
      const res = await fetch(`/api/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        toast.error(
          `Something went wrong please try again! : ${(await res.json()).error}`
        );
        throw new Error("file is not right");
      }
      return await res.json();
    },
    onSuccess(data) {
      toast.success("File submitted!", {
        className: "border border-sm ",
      });
      form.reset();
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      console.log('data: ',data)
      
       router.push(`/workspace/query?session-id=${data.dbId}`)
    },
  });

  function onSubmit(data: z.infer<typeof uploadSchema>) {
    console.log(data);
    uploadMutate(data);
  }
  return (
    <>
      <Toaster position="top-center" richColors />
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(
          " relative flex flex-col gap-4 border border-dashed px-8 py-4 font-cutive-mono"
        )}
      >
        <PlusSvg opacity={0.1} />
        <Controller
          name="file"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldContent>
                <FieldLabel
                  htmlFor={field.name}
                  className={cn("font-bold text-xl")}
                >
                  <UploadFileSvg /> Database File
                </FieldLabel>
                <FieldDescription>
                  Only .db, .sqlite and .csv files are allowed. (maximum 5MB
                  size)
                </FieldDescription>
              </FieldContent>
              <Input
               ref={fileInputRef}
                accept=".db,.sqlite,.csv"
                onChange={(e) => field.onChange(e.target.files)}
                type="file"
                aria-invalid={!!fieldState.error}
                placeholder="Drag and drop file"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <div>
          <Button
            disabled={isPending}
            type="submit"
            variant={"default"}
            className={cn("cursor-pointer rounded-sm")}
          >
            {isPending && <Spinner />}
            Submit
          </Button>
        </div>
      </form>
    </>
  );
}
