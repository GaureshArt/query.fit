import * as z from "zod"
export const liveDbConnectSchema = z.object({
  databaseType: z.enum(["postgresql", "supabase", "mysql", "neon"], {
    message: "Please select a database type.",
  }),
  connectionString: z
    .string()
    .min(1, "Connection string is required")
    .refine((val) => val.includes("://"), {
      message: "Must be a valid connection string (e.g., postgresql://...)",
    }),
  duration: z.enum(["4", "8", "12", "24"], {
    message: "Please select a session duration.",
  }),
});
