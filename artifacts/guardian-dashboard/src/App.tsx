import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import { useEffect } from "react";
import { useGuardianStore } from "@/lib/guardian-state";

const queryClient = new QueryClient();

function App() {
  const updateReadings = useGuardianStore(s => s.updateReadings);

  useEffect(() => {
    // Add dark mode class by default
    document.documentElement.classList.add('dark');

    // Run interval for sensor data
    const interval = setInterval(() => {
      updateReadings();
    }, 500);

    return () => clearInterval(interval);
  }, [updateReadings]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route component={NotFound} />
          </Switch>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;