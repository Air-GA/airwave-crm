
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

type AllowedRoles = Array<'admin' | 'manager' | 'csr' | 'sales' | 'hr' | 'tech' | 'customer' | 'user'>;

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
  // Development mode: Allow access to all routes
  return <>{children}</>;
  
  // This code will be uncommented when implementing proper role-based access:
  /*
  const { isAuthenticated, userRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to={fallbackPath} replace state={{ allowedRoles }} />;
  }

  return <>{children}</>;
  */
}
