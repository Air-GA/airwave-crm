
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '../lib/supabase';

type UserRole = 'admin' | 'manager' | 'csr' | 'sales' | 'hr' | 'tech' | 'customer';

interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  userRole: UserRole | null;
  permissions: {
    canViewProfitNumbers: boolean;
    canEditData: boolean;
    canViewAllWorkOrders: boolean;
    canViewFinancials: boolean;
    canViewHRInfo: boolean;
    canViewTechnicianData: boolean;
    canDispatchTechnicians: boolean;
  };
  login: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getRolePermissions = (role: UserRole | null) => {
  switch (role) {
    case 'admin':
      return {
        canViewProfitNumbers: true,
        canEditData: true,
        canViewAllWorkOrders: true, 
        canViewFinancials: true,
        canViewHRInfo: true,
        canViewTechnicianData: true,
        canDispatchTechnicians: true,
      };
    case 'manager':
      return {
        canViewProfitNumbers: false,
        canEditData: true,
        canViewAllWorkOrders: true,
        canViewFinancials: true,
        canViewHRInfo: true,
        canViewTechnicianData: true,
        canDispatchTechnicians: true,
      };
    case 'csr':
      return {
        canViewProfitNumbers: false,
        canEditData: false,
        canViewAllWorkOrders: true,
        canViewFinancials: true,
        canViewHRInfo: false,
        canViewTechnicianData: false,
        canDispatchTechnicians: true,
      };
    case 'sales':
      return {
        canViewProfitNumbers: false,
        canEditData: false,
        canViewAllWorkOrders: false,
        canViewFinancials: false,
        canViewHRInfo: false,
        canViewTechnicianData: false,
        canDispatchTechnicians: false,
      };
    case 'hr':
      return {
        canViewProfitNumbers: false,
        canEditData: false,
        canViewAllWorkOrders: false,
        canViewFinancials: false,
        canViewHRInfo: true,
        canViewTechnicianData: false,
        canDispatchTechnicians: false,
      };
    case 'tech':
      return {
        canViewProfitNumbers: false,
        canEditData: false,
        canViewAllWorkOrders: false,
        canViewFinancials: false,
        canViewHRInfo: false,
        canViewTechnicianData: true,
        canDispatchTechnicians: false,
      };
    case 'customer':
      return {
        canViewProfitNumbers: false,
        canEditData: false,
        canViewAllWorkOrders: false,
        canViewFinancials: false,
        canViewHRInfo: false,
        canViewTechnicianData: false,
        canDispatchTechnicians: false,
      };
    default:
      return {
        canViewProfitNumbers: false,
        canEditData: false,
        canViewAllWorkOrders: false,
        canViewFinancials: false,
        canViewHRInfo: false,
        canViewTechnicianData: false,
        canDispatchTechnicians: false,
      };
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // For demo purposes, we're setting a default role
  // In a real app, this would come from a login process
  const [userRole, setUserRole] = useState<UserRole | null>('admin');
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [user, setUser] = useState<AuthUser | null>({
    id: '1',
    email: 'admin@air-ga.net',
    role: 'admin',
    name: 'Admin User'
  });

  const permissions = getRolePermissions(userRole);

  const login = (role: UserRole) => {
    // In a real app, you would verify credentials with Supabase here
    setUserRole(role);
    setIsAuthenticated(true);
    setUser({
      id: '1',
      email: `${role}@air-ga.net`,
      role: role,
      name: `${role.charAt(0).toUpperCase() + role.slice(1)} User`
    });
  };

  const logout = () => {
    // In a real app, you would sign out from Supabase here
    setUserRole(null);
    setIsAuthenticated(false);
    setUser(null);
  };

  // In a real app with Supabase, we would check for an existing session here
  useEffect(() => {
    // For demo purposes, we're setting a default role
    // This would be replaced with a real session check
    // Example:
    // async function getInitialSession() {
    //   const { data: { session } } = await supabase.auth.getSession();
    //   if (session) {
    //     // Get user profile data to determine role
    //     const { data } = await supabase
    //       .from('profiles')
    //       .select('role')
    //       .eq('id', session.user.id)
    //       .single();
    //
    //     if (data) {
    //       setUserRole(data.role as UserRole);
    //       setUser({
    //         id: session.user.id,
    //         email: session.user.email || '',
    //         role: data.role as UserRole,
    //         name: data.name
    //       });
    //       setIsAuthenticated(true);
    //     }
    //   }
    // }
    // getInitialSession();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, userRole, permissions, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
