import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app/app-sidebar";

import TanstackQueryProvider from "@/components/providers/tanstack-query-provider";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TanstackQueryProvider>
      <SidebarProvider className="font-cutive-mono">
      <AppSidebar  />
        <SidebarInset className="">
          <header className="flex h-14 shrink-0 items-center gap-2">
            <div className="w-full  flex justify-between h-full items-center">
              <SidebarTrigger />
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 px-4 py-2 fixed w-full h-full  ">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TanstackQueryProvider>
  );
}
