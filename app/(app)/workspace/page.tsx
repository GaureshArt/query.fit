"use client"

import { useUserInfo } from "@/lib/user-store";
import { useRouter } from "next/navigation"



export default function Page() {
  const {dbid }= useUserInfo();
    const router = useRouter();
  if(dbid){
  router.push(`/workspace/query?session-id=${dbid}`)
  }
  return (
    <div className="p-6 space-y-6">
      

      <div className="text-xl font-semibold">Hello Workspace s{dbid}</div>
    </div>
  );
}
