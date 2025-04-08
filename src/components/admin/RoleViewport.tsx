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
  MessageCircle,
  MessageSquare,
  User,
  AlertTriangle,
  ShieldOff
} from "lucide-react";
import { UserRole } from "@/utils/settingsSchema";

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
  
  // Get all roles for comprehensive view
  const allRoles: UserRole[] = ['admin', 'manager', 'csr', 'sales', 'hr', 'technician', 'customer'];
  
  const hasRoleAccess = (role: UserRole, pageName: string): boolean => {
    const pageAccessMap: Record<string, UserRole[]> = {
      'dashboard': ['admin', 'manager', 'csr', 'sales', 'hr', 'technician', 'customer'],
      'customers': ['admin', 'manager', 'csr', 'sales', 'customer'],
      'work orders': ['admin', 'manager', 'csr', 'technician', 'customer'],
      'schedule': ['admin', 'manager', 'csr', 'technician', 'customer', 'hr'],
      'dispatch': ['admin', 'manager', 'csr', 'technician'],
      'inventory': ['admin', 'manager', 'technician'],
      'invoices': ['admin', 'manager', 'csr', 'sales', 'customer'],
      'reports': ['admin', 'manager', 'hr', 'sales'],
      'messages': ['admin', 'manager', 'csr', 'sales', 'hr', 'technician', 'customer'],
      'notifications': ['admin', 'manager', 'csr', 'sales', 'hr', 'technician', 'customer'],
      'timesheets': ['admin', 'manager', 'hr', 'technician', 'csr', 'sales'],
      'settings': ['admin', 'manager', 'customer']
    };
    
    // Default to no access if page is not in the map
    return pageAccessMap[pageName.toLowerCase()]?.includes(role) || false;
  };
  
  const hasDiscordIntegration = (role: UserRole): boolean => {
    return ['admin', 'manager', 'technician', 'csr'].includes(role);
  };
  
  const getRoleIcon = (role: UserRole) => {
    if (role === 'customer') {
      return <User className="h-4 w-4 mr-2" />;
    }
    return <Users className="h-4 w-4 mr-2" />;
  };
  
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
                {getRoleIcon(expanded)}
                <span className="font-medium capitalize">{expanded} View</span>
                {!hasRoleAccess(expanded, currentPage) && (
                  <Badge variant="outline" className="ml-2 bg-red-50 text-red-700">
                    <AlertTriangle className="h-3 w-3 mr-1" /> No Access
                  </Badge>
                )}
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
              {hasRoleAccess(expanded, currentPage) ? (
                <iframe 
                  src={`${window.location.pathname}?role_preview=${expanded}`}
                  className="w-full h-full border-0"
                  title={`${expanded} view`}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <ShieldOff className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Access Restricted</h3>
                  <p className="text-muted-foreground mb-4">
                    {expanded} users do not have access to the {currentPage} page.
                  </p>
                  <div className="border-t border-border w-1/2 pt-4 mt-2">
                    <p className="text-sm text-muted-foreground">
                      To modify role permissions, go to Settings &gt; Users &gt; Role Permissions
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-[calc(90vh-80px)]">
            {allRoles.map(role => (
              <div 
                key={role}
                className="rounded-lg border bg-card shadow-sm overflow-hidden flex flex-col"
              >
                <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50">
                  <div className="flex items-center">
                    {getRoleIcon(role)}
                    <span className="font-medium capitalize">{role} View</span>
                    {!hasRoleAccess(role, currentPage) && (
                      <Badge variant="outline" className="ml-2 bg-red-50 text-red-700">
                        <AlertTriangle className="h-3 w-3 mr-1" /> No Access
                      </Badge>
                    )}
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
                  {hasRoleAccess(role, currentPage) ? (
                    <iframe 
                      src={`${window.location.pathname}?role_preview=${role}`}
                      className="w-full h-full border-0 transform scale-[0.6] origin-top-left absolute"
                      style={{ width: "166.67%", height: "166.67%" }}
                      title={`${role} view`}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                      <ShieldOff className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {role} users do not have access to this page
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
