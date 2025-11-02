"use client";

import * as React from "react";

import { NavMain } from "@/components/app/nav-main";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import SettingSvg from "@/public/app-svgs/setting";
import DashboardSvg from "@/public/app-svgs/dashboard-svg";
import WorkspaceSvg from "@/public/app-svgs/workspace-svg";
import DatabaseSvg from "@/public/app-svgs/database";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AiCreditsSvg from "@/public/app-svgs/ai-credits";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import { type User } from "@supabase/supabase-js";
import { APP_INFO } from "@/constants/app-section";
import { cn } from "@/lib/utils";

const data = {
  navMain: [
    {
      title: "Workspace",
      url: "/workspace",
      icon: <WorkspaceSvg />,
      isActive: false,
    },
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <DashboardSvg />,
      isActive: false,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: <SettingSvg />,

      isActive: false,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const supabase = createClient();
  const [user, setUser] = React.useState<{ user: User } | { user: null }>();
  React.useEffect(() => {
    const getAvatarUrl = async () => {
      const { data: user } = await supabase.auth.getUser();

      setUser(user);
    };
    getAvatarUrl();
  }, []);
  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <div className="w-full h-16 bg-zinc-100 flex items-center justify-items-start gap-4 rounded-lg border  px-1 py-2  border-b-zinc-300  border-r-zinc-300">
          <DatabaseSvg />
          <h1 className="text-2xl font-bold tracking-tighter ">
            {APP_INFO.app_name}
          </h1>
        </div>
        <NavMain items={data.navMain} />
      </SidebarHeader>
      <SidebarContent></SidebarContent>
      <SidebarFooter>
        <div
          className={cn(
            "w-full h-15 border rounded-md flex items-center px-2 py-1 gap-4"
          )}
        >
          <div className={cn("w-10 h-10 bg-zinc-200 rounded-lg")}>
            <Avatar className={cn("w-full h-full rounded-lg")}>
              <AvatarImage src={user?.user?.user_metadata.avatar_url} />
              <AvatarFallback>
                {user?.user?.user_metadata.name[0]}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="">
            <h1>{user?.user?.user_metadata.name}</h1>
            <h4 className={cn("text-zinc-500 text-[12px] inline-block")}>
              Free plan
              <span className="text-zinc-800">
                <AiCreditsSvg /> 12/20
              </span>
            </h4>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
