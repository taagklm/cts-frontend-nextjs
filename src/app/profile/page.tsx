'use client';

import { AppSidebar } from "@/components/features/app-sidebar";
import ProfileClient from "@/components/features/profile";
import { SidebarProvider } from "@/components/ui/sidebar";



export default function ProfilePage() {
  return (
    // <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <SidebarProvider>
        <div style={{ display: "flex" }}>
          <AppSidebar />
          <main style={{ flex: 1 }}>
            <ProfileClient/>
          </main>
        </div>
      </SidebarProvider>
    // </ThemeProvider>
  );
}