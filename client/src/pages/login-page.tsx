import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  AdminLoginForm,
  DoctorLoginForm,
  PatientLoginForm,
  PatientRegistrationForm
} from "@/components/user-forms";

enum ScreenType {
  Main = "main",
  AdminLogin = "adminLogin",
  DoctorLogin = "doctorLogin",
  PatientLogin = "patientLogin",
  PatientRegistration = "patientRegistration"
}

const LoginPage = () => {
  const [screen, setScreen] = useState<ScreenType>(ScreenType.Main);
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to appropriate dashboard if already logged in
  useEffect(() => {
    if (user) {
      switch (user.role) {
        case "admin":
          setLocation("/admin/dashboard");
          break;
        case "doctor":
          setLocation("/doctor/dashboard");
          break;
        case "patient":
          setLocation("/patient/dashboard");
          break;
      }
    }
  }, [user, setLocation]);

  // Show the appropriate screen based on state
  const renderScreen = () => {
    switch (screen) {
      case ScreenType.Main:
        return (
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-primary">MediCare</h1>
              <p className="text-gray-500 mt-2">Hospital Management System</p>
            </div>
            
            <div className="space-y-4 mb-8">
              <button 
                onClick={() => setScreen(ScreenType.AdminLogin)}
                className="w-full py-3 px-4 bg-primary text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                Admin Login
              </button>
              
              <button 
                onClick={() => setScreen(ScreenType.DoctorLogin)}
                className="w-full py-3 px-4 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-700 transition-colors flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
                Doctor Login
              </button>
              
              <button 
                onClick={() => setScreen(ScreenType.PatientLogin)}
                className="w-full py-3 px-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                </svg>
                Patient Login
              </button>
            </div>
            
            <div className="text-center text-sm text-gray-500">
              <p>New patient? <button onClick={() => setScreen(ScreenType.PatientRegistration)} className="text-primary hover:underline">Register here</button></p>
            </div>
          </div>
        );
        
      case ScreenType.AdminLogin:
        return <AdminLoginForm onBack={() => setScreen(ScreenType.Main)} />;
        
      case ScreenType.DoctorLogin:
        return <DoctorLoginForm onBack={() => setScreen(ScreenType.Main)} />;
        
      case ScreenType.PatientLogin:
        return (
          <PatientLoginForm 
            onBack={() => setScreen(ScreenType.Main)} 
            onRegister={() => setScreen(ScreenType.PatientRegistration)}
          />
        );
        
      case ScreenType.PatientRegistration:
        return (
          <PatientRegistrationForm 
            onBack={() => setScreen(ScreenType.Main)} 
            onLogin={() => setScreen(ScreenType.PatientLogin)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
      {renderScreen()}
    </div>
  );
};

export default LoginPage;
