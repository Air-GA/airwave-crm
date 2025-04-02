
import { createContext, useContext, useState, ReactNode } from 'react';

type UserRole = 'admin' | 'manager' | 'csr' | 'sales' | 'hr' | 'tech' | 'customer' | null;

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: UserRole;
  login: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // For demo purposes, we're setting a default role
  // In a real app, this would come from a login process
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const login = (role: UserRole) => {
    setUserRole(role);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUserRole(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, login, logout }}>
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
