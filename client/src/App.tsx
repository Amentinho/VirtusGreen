import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider } from "react-helmet-async";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import GreenAgentPage from "@/pages/GreenAgentPage";
import ProducerRegister from "@/pages/ProducerRegister";
import ProducerDashboard from "@/pages/ProducerDashboard";
import ProducerLogin from "@/pages/ProducerLogin";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import BatchPassport from "@/pages/BatchPassport";
import Checklist from "@/pages/Checklist";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";
import { initGA } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";

function Router() {
  useAnalytics();
  
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/passport" component={Home} />
      <Route path="/green-agent" component={GreenAgentPage} />
      <Route path="/producer/register" component={ProducerRegister} />
      <Route path="/producer/dashboard" component={ProducerDashboard} />
      <Route path="/producer/login" component={ProducerLogin} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/passport/:batchCode" component={BatchPassport} />
      <Route path="/checklist" component={Checklist} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    if (!import.meta.env.VITE_GA_MEASUREMENT_ID) {
      console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
    } else {
      initGA();
    }
  }, []);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
