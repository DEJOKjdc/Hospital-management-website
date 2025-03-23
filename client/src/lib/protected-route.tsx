import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

type ProtectedRouteProps = {
  path: string;
  component: () => React.JSX.Element;
  role?: "admin" | "doctor" | "patient";
};

export function ProtectedRoute({
  path,
  component: Component,
  role,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/" />
      </Route>
    );
  }

  // Check if the user has the required role
  if (role && user.role !== role) {
    // Redirect to appropriate dashboard based on user role
    let redirectPath = "/";
    if (user.role === "admin") {
      redirectPath = "/admin/dashboard";
    } else if (user.role === "doctor") {
      redirectPath = "/doctor/dashboard";
    } else if (user.role === "patient") {
      redirectPath = "/patient/dashboard";
    }
    
    return (
      <Route path={path}>
        <Redirect to={redirectPath} />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}
