import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

type UserRole = 'admin' | 'manager' | 'csr' | 'sales' | 'hr' | 'tech' | 'customer' | 'user';

interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
}

interface UserProfile {
  id: string;
  role: UserRole;
  name?: string;
  email: string;
  created_at?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  userRole: UserRole | null;
  session: Session | null;
  permissions: {
    canViewProfitNumbers: boolean;
    canEditData: boolean;
    canViewAllWorkOrders: boolean;
    canViewFinancials: boolean;
    canViewHRInfo: boolean;
    canViewTechnicianData: boolean;
    canDispatchTechnicians: boolean;
  };
  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  signUp: (email: string, password: string, role?: UserRole, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  createUserProfile: (userId: string, role: UserRole, email: string, name?: string) => Promise<UserProfile | null>;
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
  const [userRole, setUserRole] = useState<UserRole | null>('admin');
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [user, setUser] = useState<AuthUser | null>({
    id: 'dev-user-id',
    email: 'dev@example.com',
    role: 'admin',
    name: 'Development User'
  });
  const [session, setSession] = useState<Session | null>(null);

  const permissions = getRolePermissions(userRole);
  
  const createUserProfile = async (userId: string, role: UserRole, email: string, name?: string): Promise<UserProfile | null> => {
    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (existingProfile) {
        console.log('Profile already exists:', existingProfile);
        return existingProfile as UserProfile;
      }
      
      const newProfile: UserProfile = {
        id: userId,
        role,
        name: name || `${role.charAt(0).toUpperCase() + role.slice(1)} User`,
        email,
      };
      
      const { data, error } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select()
        .single();
        
      if (error) {
        console.error('Error creating profile:', error);
        return null;
      }
      
      console.log('Created new profile:', data);
      return data as UserProfile;
    } catch (error) {
      console.error('Error in createUserProfile:', error);
      return null;
    }
  };

  const login = async (email: string, password: string, role: UserRole = 'admin') => {
    try {
      setUser({
        id: 'dev-user-id',
        email: email || 'dev@example.com',
        role: role,
        name: `${role.charAt(0).toUpperCase() + role.slice(1)} Dev User`
      });
      setUserRole(role);
      setIsAuthenticated(true);
      console.log('Development login successful with role:', role);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, role: UserRole = 'user', name?: string) => {
    console.log('Development signup - no actual account created');
    setUser({
      id: 'dev-user-id',
      email: email || 'dev@example.com',
      role: role,
      name: name || `${role.charAt(0).toUpperCase() + role.slice(1)} Dev User`
    });
    setUserRole(role);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      setUserRole('admin');
      setUser({
        id: 'dev-user-id',
        email: 'dev@example.com',
        role: 'admin',
        name: 'Development User'
      });
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  useEffect(() => {
    console.log('Development mode: Authentication bypassed');
  }, []);

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      userRole, 
      session,
      permissions, 
      login, 
      signUp,
      logout,
      createUserProfile
    }}>
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
