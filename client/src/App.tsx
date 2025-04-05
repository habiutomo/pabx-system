import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useState } from "react";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import CallHistory from "@/pages/call-history";
import Billing from "@/pages/billing";
import Reports from "@/pages/reports";
import RateConfig from "@/pages/rate-config";
import UserManagement from "@/pages/user-management";
import Settings from "@/pages/settings";
import Sidebar from "@/components/ui/sidebar";
import Header from "@/components/ui/header";

function Router() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar mobileMenuOpen={mobileMenuOpen} toggleMobileMenu={toggleMobileMenu} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleMobileMenu={toggleMobileMenu} />
        
        <main className="flex-1 overflow-y-auto bg-[#F3F2F1] p-6">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/call-history" component={CallHistory} />
            <Route path="/billing" component={Billing} />
            <Route path="/reports" component={Reports} />
            <Route path="/rate-config" component={RateConfig} />
            <Route path="/user-management" component={UserManagement} />
            <Route path="/settings" component={Settings} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
