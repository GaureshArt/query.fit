import NavGrid from "@/components/setting/nav-grid";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return (
    <>
     <div className={cn(" w-full h-full px-4 py-2","flex items-center justify-center")}>
      <NavGrid/>
     </div>
    </>
  );
}
