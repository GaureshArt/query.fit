import { SubscriptionData } from "@/types/subscription.types";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: subscription, error } = await supabase
    .from("subscriptions")
    .select("plan_type, credits_remaining")
    .eq("user_id", user.id)
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Subscription not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(subscription as SubscriptionData);
}
