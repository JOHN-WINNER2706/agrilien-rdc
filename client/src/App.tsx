import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Products from "./pages/Products";
import DashboardFarmer from "./pages/DashboardFarmer";
import DashboardBuyer from "./pages/DashboardBuyer";
import DashboardTransporter from "./pages/DashboardTransporter";
import ProductDetail from "./pages/ProductDetail";
import ProductForm from "./pages/ProductForm";
import OrderDetail from "./pages/OrderDetail";
import Messages from "./pages/Messages";
import RateOrder from "./pages/RateOrder";
import AdminPanel from "./pages/AdminPanel";
import DevLogin from "./pages/DevLogin";
import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect } from "react";

function DashboardRedirect() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(`/dashboard/${user.role}`, { replace: true });
    } else if (!isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  return <div className="flex items-center justify-center min-h-screen">Redirection...</div>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/produits" component={Products} />
      <Route path="/dev-login" component={DevLogin} />
      
      <Route path="/dashboard" component={DashboardRedirect} />
      <Route path="/dashboard/agriculteur" component={DashboardFarmer} />
      <Route path="/dashboard/grossiste" component={DashboardBuyer} />
      <Route path="/dashboard/transporteur" component={DashboardTransporter} />
      <Route path="/dashboard/admin" component={AdminPanel} />
      
      <Route path="/products/new" component={ProductForm} />
      <Route path="/products/:id" component={ProductDetail} />
      <Route path="/orders/:id" component={OrderDetail} />
      <Route path="/orders/:id/rate" component={RateOrder} />
      <Route path="/messages" component={Messages} />
      <Route path="/admin" component={AdminPanel} />
      
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />$env:NODE_ENV="development"; npx tsx watch server/_core/index.ts
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;