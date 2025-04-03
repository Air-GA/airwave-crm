
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '../lib/supabase';

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
  permissions: {
    canViewProfitNumbers: boolean;
    canEditData: boolean;
    canViewAllWorkOrders: boolean;
    canViewFinancials: boolean;
    canViewHRInfo: boolean;
    canViewTechnicianData: boolean;
    canDispatchTechnicians: boolean;
  };
  login: (role: UserRole, createProfile?: boolean) => Promise<void>;
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
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  const permissions = getRolePermissions(userRole);
  
  // Function to create a user profile
  const createUserProfile = async (userId: string, role: UserRole, email: string, name?: string): Promise<UserProfile | null> => {
    try {
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (existingProfile) {
        console.log('Profile already exists:', existingProfile);
        return existingProfile as UserProfile;
      }
      
      // Create new profile
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

  // Enhanced login function
  const login = async (role: UserRole, createProfile: boolean = true) => {
    try {
      // For demo app - simulate login
      setUserRole(role);
      setIsAuthenticated(true);
      
      const newUser = {
        id: '1',
        email: `${role}@air-ga.net`,
        role: role,
        name: `${role.charAt(0).toUpperCase() + role.slice(1)} User`
      };
      
      setUser(newUser);
      
      // In a real app with Supabase, this is where we would create the profile
      if (createProfile) {
        try {
          // For the demo, we'll log what would happen
          console.log(`Would create profile for user: ${JSON.stringify(newUser)}`);
          
          // For a real app, uncomment this:
          // await createUserProfile(newUser.id, role, newUser.email, newUser.name);
        } catch (error) {
          console.error('Error creating profile during login:', error);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // In a real app with Supabase, this would be:
      // await supabase.auth.signOut();
      
      setUserRole(null);
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // For demo purposes, initialize with a default state
  // In a real app, this would check the Supabase session
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // For demo, set admin by default
        // In a real app with Supabase, this would be:
        // const { data: { session } } = await supabase.auth.getSession();
        // if (session) {
        //   const { data } = await supabase
        //     .from('profiles')
        //     .select('*')
        //     .eq('id', session.user.id)
        //     .single();
        //   
        //   if (data) {
        //     setUser({
        //       id: session.user.id,
        //       email: session.user.email || '',
        //       role: data.role,
        //       name: data.name
        //     });
        //     setUserRole(data.role);
        //     setIsAuthenticated(true);
        //   }
        // }
        
        // For demo purposes:
        await login('admin', false);
      } catch (error) {
        console.error('Error initializing auth:', error);
      }
    };
    
    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      userRole, 
      permissions, 
      login, 
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
