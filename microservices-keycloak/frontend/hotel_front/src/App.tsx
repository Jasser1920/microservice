import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UsersManagement from "./pages/UsersManagement";
import RoomManagement from "./pages/RoomManagement";
import Bookings from "./pages/Bookings";
import Reviews from "./pages/Reviews";
import StockManagement from "./pages/StockManagement";
import Events from "./pages/Events";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { Role } from "./types";
import { ReactNode } from "react";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, roles }: { children: ReactNode; roles?: Role[] }) => {
  const { isAuthenticated, hasPermission, isInitialized } = useAuth();
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Loading session...</div>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !hasPermission(roles)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated, isInitialized } = useAuth();

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Loading session...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute roles={['ADMIN']}><UsersManagement /></ProtectedRoute>} />
      <Route path="/users/roles" element={<ProtectedRoute roles={['ADMIN']}><UsersManagement /></ProtectedRoute>} />
      <Route path="/rooms" element={<ProtectedRoute><RoomManagement /></ProtectedRoute>} />
      <Route path="/rooms/status" element={<ProtectedRoute roles={['ADMIN', 'MANAGER', 'STAFF']}><RoomManagement /></ProtectedRoute>} />
      <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
      <Route path="/bookings/mine" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
      <Route path="/bookings/create" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
      <Route path="/reviews" element={<ProtectedRoute><Reviews /></ProtectedRoute>} />
      <Route path="/reviews/mine" element={<ProtectedRoute><Reviews /></ProtectedRoute>} />
      <Route path="/stock" element={<ProtectedRoute roles={['ADMIN', 'MANAGER', 'STAFF']}><StockManagement /></ProtectedRoute>} />
      <Route path="/stock/alerts" element={<ProtectedRoute roles={['ADMIN', 'MANAGER', 'STAFF']}><StockManagement /></ProtectedRoute>} />
      <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
      <Route path="/events/create" element={<ProtectedRoute roles={['ADMIN', 'MANAGER']}><Events /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute roles={['ADMIN']}><Settings /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
