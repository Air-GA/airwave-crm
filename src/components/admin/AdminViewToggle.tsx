
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { RoleViewport } from "@/components/admin/RoleViewport";
import { PanelTop, Eye } from "lucide-react";
import { UserRole } from "@/utils/settingsSchema";

interface AdminViewToggleProps {
  currentPage: string;
}

export const AdminViewToggle = ({ currentPage }: AdminViewToggleProps) => {
  const { user, userRole } = useAuth();
  const [showRoleViews, setShowRoleViews] = useState(false);
  const [expandedRole, setExpandedRole] = useState<UserRole | null>(null);
  
  // Only render for admin users
  if (userRole !== 'admin') return null;
  
  // Check URL params to see if this is a preview iframe
  const isPreviewFrame = new URLSearchParams(window.location.search).has('role_preview');
  if (isPreviewFrame) return null;
  
  const handleRoleSelect = (role: UserRole | null) => {
    if (role) {
      setExpandedRole(role);
    } else {
      setExpandedRole(null);
      setShowRoleViews(!showRoleViews);
    }
  };
  
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => setShowRoleViews(true)}
      >
        <Eye className="h-4 w-4" />
        <span>View as Roles</span>
      </Button>
      
      {showRoleViews && (
        <RoleViewport 
          currentPage={currentPage}
          onRoleSelect={handleRoleSelect}
          expanded={expandedRole}
        />
      )}
    </>
  );
};
