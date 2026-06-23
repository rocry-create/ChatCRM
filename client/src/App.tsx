import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Kanban from "./pages/Kanban";
import Contacts from "./pages/Contacts";
import Chat from "./pages/Chat";
import Settings from "./pages/Settings";
import QuickReplies from "./pages/QuickReplies";
import ScheduledMessages from "./pages/ScheduledMessages";
import MediaLibrary from "./pages/MediaLibrary";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/kanban" component={Kanban} />
      <Route path="/contacts" component={Contacts} />
      <Route path="/chat/:contactId" component={Chat} />
      <Route path="/settings" component={Settings} />
      <Route path="/quick-replies" component={QuickReplies} />
      <Route path="/scheduled" component={ScheduledMessages} />
      <Route path="/media" component={MediaLibrary} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
