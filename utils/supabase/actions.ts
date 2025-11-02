"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { throwDeprecation } from "process";

export const signInWithGoogle = async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (data.url) {
    console.log(data);
    redirect(data.url);
  }
  if (error) {
    console.log(error);
  }
};

export const getUserData = async () => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (data.user) {
      return data.user;
    } else {
      return redirect("/");
    }
  } catch (err) {
    throw err;
  }
};

