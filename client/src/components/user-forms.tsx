import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

// Login schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

// Patient registration schema
const patientRegistrationSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password is required"),
  fullName: z.string().min(3, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is required"),
  address: z.string().min(5, "Address is required"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PatientRegistrationFormData = z.infer<typeof patientRegistrationSchema>;

// Admin Login Form Component
export const AdminLoginForm = ({ onBack }: { onBack: () => void }) => {
  const { loginMutation } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoginError(null);
      await loginMutation.mutateAsync(data);
    } catch (error) {
      setLoginError("Invalid username or password");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-primary">Admin Login</h2>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="admin-username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            id="admin-username"
            {...register("username")}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Enter your username"
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            id="admin-password"
            type="password"
            {...register("password")}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Enter your password"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>
        
        {loginError && (
          <div className="text-red-500 text-sm">
            {loginError}
          </div>
        )}
        
        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full py-3 px-4 bg-primary text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center"
        >
          {loginMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Login
        </button>
      </form>
    </div>
  );
};

// Doctor Login Form Component
export const DoctorLoginForm = ({ onBack }: { onBack: () => void }) => {
  const { loginMutation } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoginError(null);
      await loginMutation.mutateAsync(data);
    } catch (error) {
      setLoginError("Invalid username or password");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-cyan-600">Doctor Login</h2>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="doctor-username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            id="doctor-username"
            {...register("username")}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent"
            placeholder="Enter your username"
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="doctor-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            id="doctor-password"
            type="password"
            {...register("password")}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent"
            placeholder="Enter your password"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>
        
        {loginError && (
          <div className="text-red-500 text-sm">
            {loginError}
          </div>
        )}
        
        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full py-3 px-4 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-700 transition-colors flex items-center justify-center"
        >
          {loginMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Login
        </button>
      </form>
    </div>
  );
};

// Patient Login Form Component
export const PatientLoginForm = ({ onBack, onRegister }: { onBack: () => void; onRegister: () => void }) => {
  const { loginMutation } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoginError(null);
      await loginMutation.mutateAsync(data);
    } catch (error) {
      setLoginError("Invalid username or password");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-blue-500">Patient Login</h2>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="patient-username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            id="patient-username"
            {...register("username")}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your username"
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="patient-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            id="patient-password"
            type="password"
            {...register("password")}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your password"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>
        
        {loginError && (
          <div className="text-red-500 text-sm">
            {loginError}
          </div>
        )}
        
        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full py-3 px-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center"
        >
          {loginMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Login
        </button>
      </form>
      
      <div className="text-center text-sm text-gray-500 mt-6">
        <p>New patient? <button onClick={onRegister} className="text-blue-500 hover:underline">Register here</button></p>
      </div>
    </div>
  );
};

// Patient Registration Form Component
export const PatientRegistrationForm = ({ onBack, onLogin }: { onBack: () => void; onLogin: () => void }) => {
  const { registerMutation } = useAuth();
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm<PatientRegistrationFormData>({
    resolver: zodResolver(patientRegistrationSchema)
  });

  const onSubmit = async (data: PatientRegistrationFormData) => {
    try {
      setRegistrationError(null);
      // Remove confirmPassword as it's not needed for the API
      const { confirmPassword, ...registrationData } = data;
      await registerMutation.mutateAsync(registrationData);
    } catch (error) {
      setRegistrationError("Registration failed. Please try again.");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-blue-500">Patient Registration</h2>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label htmlFor="register-fullname" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            id="register-fullname"
            {...register("fullName")}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your full name"
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="register-username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            id="register-username"
            {...register("username")}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Choose a username"
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            id="register-email"
            type="email"
            {...register("email")}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="register-phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            id="register-phone"
            type="tel"
            {...register("phone")}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your phone number"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="register-address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <textarea
            id="register-address"
            {...register("address")}
            rows={2}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your address"
          ></textarea>
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            id="register-password"
            type="password"
            {...register("password")}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Choose a password"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="register-confirm-password" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
          <input
            id="register-confirm-password"
            type="password"
            {...register("confirmPassword")}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Confirm your password"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>
        
        {registrationError && (
          <div className="text-red-500 text-sm">
            {registrationError}
          </div>
        )}
        
        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="w-full py-3 px-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center"
        >
          {registerMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Register
        </button>
      </form>
      
      <div className="text-center text-sm text-gray-500 mt-6">
        <p>Already have an account? <button onClick={onLogin} className="text-blue-500 hover:underline">Login here</button></p>
      </div>
    </div>
  );
};
