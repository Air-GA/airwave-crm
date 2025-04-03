
import { ReactNode, useState } from "react";
import SideNav from "./SideNav";
import TopBar from "./TopBar";
import { SidebarProvider } from "@/components/ui/sidebar";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        <SideNav open={sidebarOpen} setOpen={setSidebarOpen} />
        
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar setSidebarOpen={setSidebarOpen} />
          
          <main className="flex-1 overflow-auto bg-background p-4 md:p-6">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
