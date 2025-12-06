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
import { Lock, Variable } from "lucide-react";
import LockSvg from "@/public/app-svgs/lock-svg";
import { useMutation } from "@tanstack/react-query";
import { liveDbConnectSchema } from "@/types/livedbconnect.types";
import { useRouter } from "next/navigation";
import { useUserInfo } from "@/lib/user-store";


export default function LiveDbConnectInterface() {
const router = useRouter()
const {setDbType} = useUserInfo()
  const form = useForm<z.infer<typeof liveDbConnectSchema>>({
    resolver: zodResolver(liveDbConnectSchema),
    defaultValues: {
      connectionString: "",
      databaseType: "postgresql",
    },
  });

  const mutate = useMutation({
    mutationKey:["live-database-connection"],
    mutationFn:async (liveDbData:z.infer<typeof liveDbConnectSchema>)=>{
        const res = await fetch(`/api/db`,{
          method:"POST",
          body:JSON.stringify(liveDbData),
          headers:{"Content-Type":"application/json"}
        });
        const data = await res.json()
        console.log("responese: ",data)
        return data;
    },
    onSuccess:(data,variable)=>{
      setDbType(variable.databaseType);
      router.push(`/workspace/query?session-id=live_${data.dbId}`)
    }
    
  })
  const onSubmit = (data: z.infer<typeof liveDbConnectSchema>) => {
    console.log("Submitting:", data);
    mutate.mutate(data)
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
              name="duration"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="mt-4 font-cutive-mono">
                  <FieldLabel htmlFor="duration">Session Duration</FieldLabel>
                  <Select
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id="duration"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Select Duration" />
                    </SelectTrigger>
                    <SelectContent className="font-cutive-mono">
                      <SelectItem value="4">4 Hours </SelectItem>
                      <SelectItem value="8">8 Hours </SelectItem>
                      <SelectItem value="12">12 Hours</SelectItem>
                      <SelectItem value="24">24 Hours (Max)</SelectItem>
                    </SelectContent>
                  </Select>
                 
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
             <div className="mt-2 flex items-start gap-3 rounded-md bg-amber-50 p-3 text-sm text-amber-900 border border-amber-100">
                    <LockSvg />
                    <div className="leading-relaxed">
                      Credentials are encrypted at rest and{" "}
                      <strong>automatically cleared</strong> when your duration
                      ends.
                    </div>
                  </div>
          </FieldGroup>

          <Button disabled={mutate.isPending} type="submit" className={cn("mt-4 w-full")}>
            Connect Database
          </Button>
        </form>
      </div>
    </div>
  );
}
