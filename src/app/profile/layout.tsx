import { AppSidebar } from "@/components/features/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export const metadata = {
  title: "CTS | Profile",
  description: "User profile page for CTS",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col flex-grow min-h-screen pt-2">
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-grow flex justify-center items-center">{children}</main>
      </SidebarProvider>
    </div>
  );
}

