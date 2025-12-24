import { SETTINGS_COMPONENTS } from "@/components/app/setting/sub-nav-registry";
import { cn } from "@/lib/utils";

export default function Page({params}:{params:{type:string}}) {

    const Component = SETTINGS_COMPONENTS[params.type];
    if(!Component){
        return <>No special</>
    }
    return (
        <>
        <div className={cn("flex justify-center items-center w-full h-full")}>

        {Component}
        </div>
        </>
    )
}