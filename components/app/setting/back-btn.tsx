"use client"
import { Button } from "@/components/ui/button";

import BackBtnSvg from "@/public/app-svgs/back-btn-svg";
import { useRouter } from "next/navigation";

export default function BackBtn() {
    const router = useRouter();
    return (
        <Button className="absolute top-20 left-60 cursor-pointer" variant={"secondary"} onClick={()=>{
            router.back();
        }}>
        <BackBtnSvg/>
        </Button>
    )
}