import { AppSidebar } from "@/components/features/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col flex-grow min-h-screen">
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-grow flex justify-center">{children}</main>
      </SidebarProvider>
    </div>
  );
}