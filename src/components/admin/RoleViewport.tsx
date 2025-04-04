import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { 
  Maximize, 
  Minimize,
  X, 
  Users,
  MessagesSquare,
  LayoutDashboard,
  MessageCircle
} from "lucide-react";

type UserRole = 'admin' | 'manager' | 'csr' | 'sales' | 'hr' | 'tech' | 'customer' | 'user';

interface RoleViewportProps {
  currentPage: string;
  onRoleSelect: (role: UserRole | null) => void;
  expanded?: UserRole | null;
}

export const RoleViewport = ({ 
  currentPage, 
  onRoleSelect,
  expanded
}: RoleViewportProps) => {
  const { userRole } = useAuth();
  
  const getRolesForPage = (pageName: string): UserRole[] => {
    const baseRoles: UserRole[] = ['manager', 'csr'];
    
    switch(pageName.toLowerCase()) {
      case 'dashboard':
        return ['manager', 'csr', 'sales', 'hr', 'tech', 'customer', 'user'];
      case 'customers':
        return ['manager', 'csr', 'sales', 'user'];
      case 'work orders':
        return ['manager', 'csr', 'tech', 'customer', 'user'];
      case 'schedule':
        return ['manager', 'csr', 'tech', 'hr', 'customer', 'user'];
      case 'dispatch':
        return ['manager', 'csr', 'tech', 'user'];
      case 'inventory':
        return ['manager', 'csr', 'tech', 'user'];
      case 'invoices':
        return ['manager', 'csr', 'sales', 'customer', 'user'];
      case 'reports':
        return ['manager', 'hr', 'user'];
      case 'messages':
        return ['manager', 'csr', 'sales', 'hr', 'tech', 'customer', 'user'];
      case 'notifications':
        return ['manager', 'csr', 'sales', 'hr', 'tech', 'customer', 'user'];
      case 'timesheets':
        return ['manager', 'hr', 'tech', 'user'];
      case 'settings':
        return ['manager', 'customer', 'user'];
      default:
        return baseRoles;
    }
  };
  
  const hasDiscordIntegration = (role: UserRole): boolean => {
    return ['admin', 'manager', 'tech'].includes(role);
  };
  
  const availableRoles = getRolesForPage(currentPage);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-7xl p-4 h-[90vh]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            {currentPage.toLowerCase() === 'messages' ? (
              <MessagesSquare className="h-5 w-5 mr-2" />
            ) : (
              <LayoutDashboard className="h-5 w-5 mr-2" />
            )}
            <h2 className="text-xl font-bold">Role View: {currentPage}</h2>
            <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700">
              Admin Feature
            </Badge>
          </div>
          <button 
            onClick={() => onRoleSelect(null)} 
            className="rounded-full p-2 hover:bg-muted"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </button>
        </div>
        
        {expanded ? (
          <div className="h-[calc(90vh-80px)] rounded-lg border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                <span className="font-medium capitalize">{expanded} View</span>
                {currentPage.toLowerCase() === 'messages' && hasDiscordIntegration(expanded) && (
                  <Badge variant="outline" className="ml-2 bg-green-50 text-green-700">
                    Discord Enabled
                  </Badge>
                )}
              </div>
              <button 
                onClick={() => onRoleSelect(null)} 
                className="p-1 rounded hover:bg-muted/80"
              >
                <Minimize className="h-4 w-4" />
              </button>
            </div>
            <div className="h-[calc(100%-40px)] w-full">
              <iframe 
                src={`${window.location.pathname}?role_preview=${expanded}`}
                className="w-full h-full border-0"
                title={`${expanded} view`}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-[calc(90vh-80px)]">
            {availableRoles.map(role => (
              <div 
                key={role}
                className="rounded-lg border bg-card shadow-sm overflow-hidden flex flex-col"
              >
                <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    <span className="font-medium capitalize">{role} View</span>
                    {currentPage.toLowerCase() === 'messages' && hasDiscordIntegration(role) && (
                      <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 text-xs">
                        Discord Enabled
                      </Badge>
                    )}
                  </div>
                  <button 
                    onClick={() => onRoleSelect(role)} 
                    className="p-1 rounded hover:bg-muted/80"
                  >
                    <Maximize className="h-4 w-4" />
                  </button>
                </div>
                <div className="relative h-full w-full">
                  <iframe 
                    src={`${window.location.pathname}?role_preview=${role}`}
                    className="w-full h-full border-0 transform scale-[0.6] origin-top-left absolute"
                    style={{ width: "166.67%", height: "166.67%" }}
                    title={`${role} view`}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
