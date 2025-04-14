
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

// Update the type to include 'user'
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
  const { isAuthenticated, userRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!userRole || !allowedRoles.includes(userRole)) {
    // Pass the allowed roles as state to the unauthorized page
    return <Navigate to={fallbackPath} replace state={{ allowedRoles }} />;
  }

  return <>{children}</>;
}
