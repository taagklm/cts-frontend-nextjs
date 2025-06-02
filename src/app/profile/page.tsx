'use client';

import { AppSidebar } from "@/components/features/app-sidebar";
import ProfileClient from "@/components/features/profile";
import { UsersTable } from "@/components/features/users";
import { Card } from "@/components/ui/card";
import { SidebarProvider } from "@/components/ui/sidebar";



export default function Page() {
  return (
    <div className="w-full max-w-[1280px] mx-auto sm:p-6">
      <Card className="border-none shadow-none">
        <div className="px-12 pt-0">
          <ProfileClient />
        </div>
      </Card>
    </div>
  );
}