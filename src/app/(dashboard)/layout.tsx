"use client";

import { SidebarProvider } from "@/contexts/sidebar-context";
import { DashboardHeader } from "@/components/Header/header";
import { ContentWrapper } from "@/components/ContentWrapper/content-wrapper";
import { SidebarContainer } from "@/components/Sidebar/sidebar-container";
import { useSidebar } from "@/contexts/sidebar-context";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingScreen } from "@/components/LoadingScreen/loading-screen";
import { cn } from "@/lib/utils";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isOpen, isMobile } = useSidebar();
  const { isLoading } = useAuth();

  return (
    <div className="flex flex-col flex-1 h-screen">
      {isLoading && <LoadingScreen />}
      
      {/* Fixed header */}
      <div
        className={cn(
          "fixed top-0 right-0 left-0 z-40 transition-[margin] duration-300",
          !isMobile && (isOpen
            ? "ml-[var(--sidebar-width)]"
            : "ml-[var(--sidebar-collapsed-width)]")
        )}
      >
        <DashboardHeader />
      </div>

      {/* Main content */}
      <ContentWrapper>
        <main
          className={cn(
            "absolute inset-0 mt-16 p-6 overflow-auto transition-[margin] duration-300",
            !isMobile && (isOpen
              ? "ml-[var(--sidebar-width)]"
              : "ml-[var(--sidebar-collapsed-width)]")
          )}
        >
          {children}
        </main>
      </ContentWrapper>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background overflow-hidden">
        <SidebarContainer />
        <DashboardContent>{children}</DashboardContent>
      </div>
    </SidebarProvider>
  );
}
