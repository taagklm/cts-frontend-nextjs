import { AppSidebar } from "@/components/features/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start font-sans text-sm font-normal h-screen overflow-y-hidden">
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-grow flex justify-center items-start">{children}</main>
      </SidebarProvider>
    </div>
  );
}