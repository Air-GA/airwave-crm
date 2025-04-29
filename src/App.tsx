
import { useEffect } from 'react';
import { initializeCustomerStore } from '@/services/customerStore';
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Toaster } from "@/components/ui/toaster";
import RoutesComponent from "./RoutesComponent";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  useEffect(() => {
    // Initialize global stores
    initializeCustomerStore();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}

export default App;
