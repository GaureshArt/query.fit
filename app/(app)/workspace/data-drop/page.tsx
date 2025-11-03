import FileDrop from "@/components/app/workspace/file-drop";
import { cn } from "@/lib/utils";
export default function Page(){

    return (
       <section className={cn("px-4 py-2 w-full h-full flex justify-center items-center")}>
            
        <FileDrop/>
       </section>
    )
}