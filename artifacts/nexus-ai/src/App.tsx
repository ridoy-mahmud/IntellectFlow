import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import NewMission from "@/pages/NewMission";
import MissionMonitor from "@/pages/MissionMonitor";
import Projects from "@/pages/Projects";
import Analytics from "@/pages/Analytics";
import Settings from "@/pages/Settings";
import AgentStudio from "@/pages/AgentStudio";
import Workflows from "@/pages/Workflows";
import Documentation from "@/pages/Documentation";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
      gcTime: 300000,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/dashboard/new-mission" component={NewMission} />
      <Route path="/dashboard/mission/:id" component={MissionMonitor} />
      <Route path="/dashboard/projects" component={Projects} />
      <Route path="/dashboard/analytics" component={Analytics} />
      <Route path="/dashboard/settings" component={Settings} />
      <Route path="/dashboard/agents" component={AgentStudio} />
      <Route path="/dashboard/workflows" component={Workflows} />
      <Route path="/dashboard/documentation" component={Documentation} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
