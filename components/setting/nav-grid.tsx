"use client"
import { cn } from "@/lib/utils";
import { useSidebar } from "../ui/sidebar";
import { SETTINGS_SUB_NAV } from "@/constants/setting-sub-nav";
import Link from "next/link";


export default function NavGrid() {
    const {open:isSidebarOpen} = useSidebar();
    return (
        <>
         <div className={cn("w-1/2 h-70",isSidebarOpen?"mr-70":"","grid grid-cols-2 grid-rows-2")}>
            {
                SETTINGS_SUB_NAV.map((nav)=>
                <div key={nav.id} className="border border-zinc-500 rounded-lg px-4 py-2 w-90 h-28">
                    <Link href={nav.link}>
                    <h1 className="font-bold">{nav.name}</h1>
                    </Link>
                    <p className={cn("text-sm mt-2 text-justify")}>
                        {nav.description}
                    </p>
                </div>
                )
            }
       </div>
        </>
    )
}