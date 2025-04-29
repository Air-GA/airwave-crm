import { useEffect } from 'react';
import { initializeCustomerStore } from '@/services/customerStore';
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Toaster } from "@/components/ui/toaster";
import RoutesComponent from "./RoutesComponent";

function App() {
  useEffect(() => {
    // Initialize global stores
    initializeCustomerStore();
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <SiteHeader />
          <main className="flex-1">
            <RoutesComponent />
          </main>
          <SiteFooter />
        </div>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
