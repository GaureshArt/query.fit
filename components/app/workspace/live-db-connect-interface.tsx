"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { DATABASE_TYPES } from "@/constants/workspace-section";
import { Lock } from "lucide-react";
import LockSvg from "@/public/app-svgs/lock-svg";

export const formSchema = z.object({
  databaseType: z.enum(["postgresql", "supabase", "mysql", "neon"], {
    message: "Please select a database type.",
  }),
  connectionString: z
    .string()
    .min(1, "Connection string is required")
    .refine((val) => val.includes("://"), {
      message: "Must be a valid connection string (e.g., postgresql://...)",
    }),
});

export default function LiveDbConnectInterface() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      connectionString: "",
      databaseType: "postgresql",
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log("Submitting:", data);
  };

  return (
    <div className={cn("w-full h-90")}>
      <div className={cn("w-full border border-zinc-400 p-6 rounded-md")}>
        <form
          id="live-db-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className={cn("font-cutive-mono")}
        >
          <FieldGroup>
            <Controller
              name="databaseType"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className={cn("")}>
                  <FieldLabel htmlFor="database-type" className={cn("")}>
                    Database Type
                  </FieldLabel>

                  <Select
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id="database-type"
                      aria-invalid={fieldState.invalid}
                      className={cn("")}
                    >
                      <SelectValue
                        placeholder="Choose Database"
                        className={cn("font-bold")}
                      />
                    </SelectTrigger>

                    <SelectContent className={cn("")}>
                      {DATABASE_TYPES.map((item) => (
                        <SelectItem
                          value={item.name.toLowerCase()}
                          key={item.id}
                          className={cn("flex gap-4 items-center")}
                        >
                          <div className={cn("flex items-center gap-2")}>
                            {item.iconUrl && (
                              <Image
                                src={item.iconUrl}
                                width={20}
                                height={20}
                                alt={item.name}
                                className={cn("")}
                              />
                            )}
                            <span
                              className={cn(
                                "font-bold font-cutive-mono text-sm"
                              )}
                            >
                              {item.name}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {fieldState.invalid && (
                    <FieldError
                      errors={[fieldState.error]}
                      className={cn("")}
                    />
                  )}
                </Field>
              )}
            />

            <Controller
              name="connectionString"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className={cn("")}>
                  <FieldLabel htmlFor="conn-string" className={cn("")}>
                    Connection String
                  </FieldLabel>
                  <Input
                    {...field}
                    id="conn-string"
                    type="password"
                    placeholder="postgresql://user:pass@host:5432/db"
                    aria-invalid={fieldState.invalid}
                    className={cn("")}
                  />
                  <div className="mt-2 flex items-start gap-3 rounded-md bg-amber-50 p-3 text-sm text-amber-900 border border-amber-100">
                    <LockSvg />
                    <div className="leading-relaxed">
                      Credentials are encrypted at rest and{" "}
                      <strong>automatically cleared</strong> when your session
                      ends.
                    </div>
                  </div>
                  {fieldState.invalid && (
                    <FieldError
                      errors={[fieldState.error]}
                      className={cn("")}
                    />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <Button type="submit" className={cn("mt-4 w-full")}>
            Connect Database
          </Button>
        </form>
      </div>
    </div>
  );
}
