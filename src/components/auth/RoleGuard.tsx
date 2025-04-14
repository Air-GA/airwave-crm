
import { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

type AllowedRoles = Array<'admin' | 'manager' | 'csr' | 'sales' | 'hr' | 'technician' | 'customer'>;

interface RoleGuardProps {
  allowedRoles: AllowedRoles;
}

const RoleGuard = ({ allowedRoles }: RoleGuardProps) => {
  const { isAuthenticated, userRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!userRole || !allowedRoles.includes(userRole)) {
    // Pass the allowed roles as state to the unauthorized page
    return <Navigate to="/unauthorized" replace state={{ allowedRoles }} />;
  }

  return <Outlet />;
};

export default RoleGuard;
