import { Database } from "./supabase.types";

export type SubscriptionData = {
    plan_type:Database['public']['Enums']['plan_type'],
    credits_remaining:Database['public']['Tables']['subscriptions']['Row']['credits_remaining']
}