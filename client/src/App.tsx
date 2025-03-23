import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/toaster";
import LoginPage from "@/pages/login-page";
import AdminDashboard from "@/pages/admin-dashboard";
import DoctorDashboard from "@/pages/doctor-dashboard";
import PatientDashboard from "@/pages/patient-dashboard";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LoginPage} />
      <ProtectedRoute path="/admin/dashboard" role="admin" component={AdminDashboard} />
      <ProtectedRoute path="/doctor/dashboard" role="doctor" component={DoctorDashboard} />
      <ProtectedRoute path="/patient/dashboard" role="patient" component={PatientDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
