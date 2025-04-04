
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
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);

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

  // Enhanced login function with real Supabase auth
  const login = async (email: string, password: string, role?: UserRole) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      setSession(data.session);
      
      if (data.user) {
        // Get the user profile from our profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        // If we have a profile, use it; otherwise, use the demo behavior
        if (profile) {
          const userProfile: AuthUser = {
            id: data.user.id,
            email: data.user.email || '',
            role: profile.role as UserRole,
            name: profile.name
          };
          
          setUser(userProfile);
          setUserRole(profile.role);
          setIsAuthenticated(true);
        } else if (role) {
          // Fallback to demo mode if no profile exists but role is provided
          console.log('No profile found, using demo mode with provided role');
          const demoUser = {
            id: data.user.id,
            email: email,
            role: role,
            name: `${role.charAt(0).toUpperCase() + role.slice(1)} User`
          };
          
          setUser(demoUser);
          setUserRole(role);
          setIsAuthenticated(true);
          
          // Create a profile for future use
          await createUserProfile(data.user.id, role, email, demoUser.name);
        } else {
          console.error('No profile found and no role provided for demo mode');
          throw new Error('Unable to determine user role');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Function to sign up new users
  const signUp = async (email: string, password: string, role: UserRole = 'user', name?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            name
          }
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        console.log('User signed up:', data.user.id);
        // The trigger will create the profile
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUserRole(null);
      setIsAuthenticated(false);
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event);
        setSession(session);
        
        if (session?.user) {
          // Use setTimeout to avoid recursive calls
          setTimeout(async () => {
            try {
              // Get user profile
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
                
              if (profile) {
                setUser({
                  id: session.user.id,
                  email: session.user.email || '',
                  role: profile.role as UserRole,
                  name: profile.name
                });
                setUserRole(profile.role);
                setIsAuthenticated(true);
              } else {
                console.log('No profile found for user');
                setIsAuthenticated(false);
              }
            } catch (error) {
              console.error('Error fetching profile:', error);
            }
          }, 0);
        } else {
          setUser(null);
          setUserRole(null);
          setIsAuthenticated(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      
      if (session?.user) {
        // Use setTimeout to avoid recursive calls
        setTimeout(async () => {
          try {
            // Get user profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
              
            if (profile) {
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                role: profile.role as UserRole,
                name: profile.name
              });
              setUserRole(profile.role);
              setIsAuthenticated(true);
            }
          } catch (error) {
            console.error('Error fetching profile:', error);
          }
        }, 0);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
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
