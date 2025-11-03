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
  const form = useForm<z.infer<typeof uploadSchema>>({
    resolver: zodResolver(uploadSchema),
  });

  function onSubmit(data: z.infer<typeof uploadSchema>) {
    console.log("File submited")
    console.log(data.file[0]);
  }
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}  className={cn(" relative flex flex-col gap-4 border border-dashed px-8 py-4 font-cutive-mono")}>
        <PlusSvg opacity={.1}/>
      <Controller
        name="file"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldContent>
              <FieldLabel htmlFor={field.name} className={cn("font-bold text-xl")}><UploadFileSvg/> Database File</FieldLabel>
              <FieldDescription>
                Only .db, .sqlite and .csv files are allowed. (mximum 5MB size)
              </FieldDescription>
            </FieldContent>
            <Input
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
        <Button type="submit" variant={"default"} className={cn("cursor-pointer rounded-sm")}>Submit</Button>
        </div>
    </form>
  );
}
