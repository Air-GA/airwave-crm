
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';

type LocationState = {
  allowedRoles?: Array<string>;
};

const Unauthorized = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole } = useAuth();
  
  // Get allowed roles from the state if available
  const state = location.state as LocationState;
  const allowedRoles = state?.allowedRoles || [];
  
  // Format the allowed roles for display
  const formatRoles = (roles: string[]) => {
    if (roles.length === 0) return "authorized users";
    if (roles.length === 1) return roles[0];
    if (roles.length === 2) return `${roles[0]} and ${roles[1]}`;
    
    const lastRole = roles[roles.length - 1];
    const otherRoles = roles.slice(0, -1).join(', ');
    return `${otherRoles}, and ${lastRole}`;
  };

  return (
    <MainLayout>
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-6 max-w-md">
          <div className="flex justify-center">
            <AlertCircle className="h-16 w-16 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to access this page. This area is restricted to {formatRoles(allowedRoles)} only.
          </p>
          <p className="text-muted-foreground">
            Your current role is: <span className="font-semibold">{userRole || 'Unknown'}</span>
          </p>
          <div className="flex justify-center space-x-4">
            <Button onClick={() => navigate('/')}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Unauthorized;
