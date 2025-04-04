
import { ReactNode, useState } from "react";
import SideNav from "./SideNav";
import TopBar from "./TopBar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminViewToggle } from "@/components/admin/AdminViewToggle";
import { useLocation } from "react-router-dom";

interface MainLayoutProps {
  children: ReactNode;
  pageName?: string;
}

const MainLayout = ({ children, pageName }: MainLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  
  // Extract page name from pathname
  const getPageName = () => {
    if (pageName) return pageName;
    
    const path = location.pathname;
    if (path === "/") return "Dashboard";
    
    return path.split("/")[1]
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };
  
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        <SideNav open={sidebarOpen} setOpen={setSidebarOpen} />
        
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar setSidebarOpen={setSidebarOpen}>
            <AdminViewToggle currentPage={getPageName()} />
          </TopBar>
          
          <main className="flex-1 overflow-auto bg-background p-4 md:p-6">
            <div className="w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
