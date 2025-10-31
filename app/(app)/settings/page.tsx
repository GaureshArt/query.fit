
import { createClient } from "@/utils/supabase/server"

export default async function Page(){
    const supabase = await createClient();
    const user = await supabase.auth.getUser();
    if(!user.data.user?.id){
        console.log(user.data)
        return <>
        user not log in
       
        </>
    }

    const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('credits_remaining') 
    .eq('user_id', user.data.user.id)    
    .single();
    return (
        <>
        user log in {user.data.user.email}

        user credits data: {subscription?.credits_remaining}
        </>
    )
}