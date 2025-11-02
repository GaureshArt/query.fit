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

import { APP_INFO } from "@/constants/app-section";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserData } from "@/utils/supabase/actions";
import { SubscriptionData } from "@/types/subscription.types";

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
  const {
    data: user,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["user", "user-info"],
    queryFn: getUserData,
  });
  const { data: planData} = useQuery<SubscriptionData , Error>({
    queryKey: ["user", "subscription-plan"],
    queryFn: async () => {
      const res = await fetch("/api/subscription");
      if (!res.ok) {
        throw new Error("Failed to fetch subscription");
      }
      return await res.json();
    },
  });
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className={cn("w-full h-16 bg-zinc-100 flex items-center justify-items-start gap-4 rounded-lg border  px-1 py-2  border-b-zinc-300  border-r-zinc-300")}>
          <DatabaseSvg />
          <h1 className={cn("text-2xl font-bold tracking-tighter ")}>
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
              <AvatarImage src={user?.user_metadata.avatar_url} />
              <AvatarFallback>{user?.user_metadata.name[0]}</AvatarFallback>
            </Avatar>
          </div>
          <div className={cn("flex  flex-col items-baseline font-bold")}>
            <h1>{user?.user_metadata.name}</h1>
            <h4 className={cn("text-muted-foreground text-[12px] inline-block")}>
              {planData?.plan_type} plan
              <span className={cn("text-sm ml-2 text-foreground/80 tracking-tighter ")}>
                 {planData?.credits_remaining}
              </span>
              <span className={cn("ml-1")}>credits</span>
            </h4>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
