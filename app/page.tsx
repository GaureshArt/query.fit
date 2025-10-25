import LandingMain from "@/components/landing/landing-main";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient()
  const user = await supabase.auth.getUser();
      if(user.data.user?.id){
          redirect('/settings')
      }
  return (
    <>
      <LandingMain />
    </>
  );
}
