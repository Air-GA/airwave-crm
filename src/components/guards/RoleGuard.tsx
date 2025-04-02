
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

type AllowedRoles = Array<'admin' | 'manager' | 'csr' | 'sales' | 'hr' | 'tech' | 'customer'>;

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: AllowedRoles;
  fallbackPath?: string;
}

export function RoleGuard({ 
  children, 
  allowedRoles, 
  fallbackPath = "/unauthorized" 
}: RoleGuardProps) {
  const { isAuthenticated, userRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}
