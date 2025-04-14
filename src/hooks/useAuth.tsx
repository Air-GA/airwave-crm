
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '../lib/supabase';

type UserRole = 'admin' | 'manager' | 'csr' | 'sales' | 'hr' | 'tech' | 'customer' | 'user';

interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  associatedIds?: string[]; // IDs of records this user is associated with (e.g., customer IDs for sales)
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
    // Added more granular permissions
    canViewOnlyAssociatedCustomers: boolean;
    canViewCustomerPaymentHistory: boolean;
    canViewFuturePaymentPlans: boolean;
    canViewOnlyOwnWorkOrders: boolean;
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
        canViewOnlyAssociatedCustomers: false, // Admin sees all customers
        canViewCustomerPaymentHistory: true,
        canViewFuturePaymentPlans: true,
        canViewOnlyOwnWorkOrders: false, // Admin sees all work orders
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
        canViewOnlyAssociatedCustomers: false, // Managers see all customers
        canViewCustomerPaymentHistory: true,
        canViewFuturePaymentPlans: true,
        canViewOnlyOwnWorkOrders: false, // Managers see all work orders
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
        canViewOnlyAssociatedCustomers: false, // CSRs see all customers
        canViewCustomerPaymentHistory: true,
        canViewFuturePaymentPlans: true,
        canViewOnlyOwnWorkOrders: false, // CSRs see all work orders
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
        canViewOnlyAssociatedCustomers: true, // Sales only see customers they sold to
        canViewCustomerPaymentHistory: true,
        canViewFuturePaymentPlans: true,
        canViewOnlyOwnWorkOrders: true, // Sales only see own work orders
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
        canViewOnlyAssociatedCustomers: false, // HR doesn't see customers
        canViewCustomerPaymentHistory: false,
        canViewFuturePaymentPlans: false,
        canViewOnlyOwnWorkOrders: false, // HR doesn't see work orders
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
        canViewOnlyAssociatedCustomers: false, // Techs see all customers
        canViewCustomerPaymentHistory: false,
        canViewFuturePaymentPlans: false,
        canViewOnlyOwnWorkOrders: true, // Techs only see own work orders
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
        canViewOnlyAssociatedCustomers: false, // Not applicable for customer
        canViewCustomerPaymentHistory: true, // Customers can see their payment history
        canViewFuturePaymentPlans: true, // Customers can see future payment plans
        canViewOnlyOwnWorkOrders: true, // Customers only see own work orders
      };
    case 'user':
      return {
        canViewProfitNumbers: false,
        canEditData: true,
        canViewAllWorkOrders: true,
        canViewFinancials: false,
        canViewHRInfo: false,
        canViewTechnicianData: false,
        canDispatchTechnicians: false,
        canViewOnlyAssociatedCustomers: false,
        canViewCustomerPaymentHistory: true,
        canViewFuturePaymentPlans: true,
        canViewOnlyOwnWorkOrders: false,
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
        canViewOnlyAssociatedCustomers: false,
        canViewCustomerPaymentHistory: false,
        canViewFuturePaymentPlans: false,
        canViewOnlyOwnWorkOrders: false,
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
    name: 'Admin User',
    associatedIds: [] // In a real app, this would be populated with actual IDs
  });

  useEffect(() => {
    // Check for role preview in URL query params
    const params = new URLSearchParams(window.location.search);
    const rolePreview = params.get('role_preview') as UserRole | null;
    
    if (rolePreview && ['admin', 'manager', 'csr', 'sales', 'hr', 'tech', 'customer', 'user'].includes(rolePreview)) {
      // If this is a preview iframe, use the role from query params
      if (user && user.role === 'admin') {
        // Create mock associated IDs for role preview
        let mockAssociatedIds: string[] = [];
        
        // For sales, create mock customer IDs
        if (rolePreview === 'sales') {
          mockAssociatedIds = ['customer-123', 'customer-456']; // Mock customer IDs
        }
        // For customer, create a mock ID representing themselves
        else if (rolePreview === 'customer') {
          mockAssociatedIds = ['customer-789']; // The customer's own ID
        }
        // For tech, create mock work order IDs they're assigned to
        else if (rolePreview === 'tech') {
          mockAssociatedIds = ['workorder-123', 'workorder-456']; // Mock work order IDs
        }
        
        const previewUser = { 
          ...user, 
          role: rolePreview,
          name: `${rolePreview.charAt(0).toUpperCase() + rolePreview.slice(1)} View`,
          associatedIds: mockAssociatedIds
        };
        setUser(previewUser);
        setUserRole(rolePreview);
      }
    }
  }, [user]);

  const permissions = getRolePermissions(userRole);

  const login = (role: UserRole) => {
    // In a real app, you would verify credentials with Supabase here
    // and fetch associated IDs based on the user's role
    let mockAssociatedIds: string[] = [];
    
    // Set up mock associated IDs based on role
    if (role === 'sales') {
      mockAssociatedIds = ['customer-123', 'customer-456']; // Mock customer IDs for sales
    } else if (role === 'customer') {
      mockAssociatedIds = ['customer-789']; // Customer's own ID
    } else if (role === 'tech') {
      mockAssociatedIds = ['workorder-123', 'workorder-456']; // Work orders assigned to tech
    }
    
    setUserRole(role);
    setIsAuthenticated(true);
    setUser({
      id: '1',
      email: `${role}@air-ga.net`,
      role: role,
      name: `${role.charAt(0).toUpperCase() + role.slice(1)} User`,
      associatedIds: mockAssociatedIds
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
