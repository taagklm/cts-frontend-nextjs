import { AppSidebar } from "@/components/features/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export const metadata = {
  title: "CTS | Profile",
  description: "User profile page for CTS",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col flex-grow font-sans text-sm font-normal h-screen overflow-y-hidden">
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-grow flex justify-center">{children}</main>
      </SidebarProvider>
    </div>
  );
}

