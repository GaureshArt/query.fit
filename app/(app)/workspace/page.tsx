import LiveDbConnectInterface from "@/components/app/workspace/live-db-connect-interface";
import { cn } from "@/lib/utils";
import Link from "next/link";



export default function Page() {
  
  return (
    <div className="p-3 space-y-6 w-1/2 ml-60 overflow-hidden h-full flex flex-col items-center justify-top">
      <div>
        External DB Files to drop <Link className={cn("text-blue-600 font-bold")} href={`workspace/data-drop`}>
         click here
        </Link>
      </div>
      <LiveDbConnectInterface/>
    </div>
  );
}
