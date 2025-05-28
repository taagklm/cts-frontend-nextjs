'use client';

import { AppSidebar } from "@/components/features/app-sidebar";
import ProfileClient from "@/components/features/profile";
import { SidebarProvider } from "@/components/ui/sidebar";



export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div>
        <ProfileClient />
      </div>
    </SidebarProvider>
  );
}