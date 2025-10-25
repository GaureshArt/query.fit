import CtaButton from "@/components/landing/cta-button";
import { createClient } from "@/utils/supabase/server"

export default async function Page(){
    const supabase = await createClient();
    const user = await supabase.auth.getUser();
    if(!user.data.user?.id){
        console.log(user.data)
        return <>
        user not log in
        <CtaButton text="Log in"/>
        </>
    }
    return (
        <>
        user log in {user.data.user.email}
        </>
    )
}