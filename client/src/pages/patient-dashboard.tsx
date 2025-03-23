import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { AppointmentBooking } from "@/components/appointment-booking";
import { addToGoogleCalendar, isGoogleAuthenticated, authenticateWithGoogle } from "@/lib/google-calendar";

type ContentType = "dashboard" | "appointments" | "book-appointment" | "prescriptions" | "records" | "billing" | "profile";

// Profile update schema
const profileUpdateSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email").nullable(),
  phone: z.string().nullable(),
  address: z.string().nullable(),
  medicalHistory: z.string().nullable(),
  healthConditions: z.string().nullable(),
});

type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;

const PatientDashboard = () => {
  const [activeContent, setActiveContent] = useState<ContentType>("dashboard");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();

  // Get patient profile
  const { data: patientProfile, isLoading: isLoadingProfile, refetch: refetchProfile } = useQuery({
    queryKey: ["/api/my-patient-profile"],
  });

  // Get patient's appointments
  const { data: appointments, isLoading: isLoadingAppointments, refetch: refetchAppointments } = useQuery({
    queryKey: ["/api/my-appointments"],
    enabled: activeContent === "dashboard" || activeContent === "appointments",
  });

  // Get patient's prescriptions
  const { data: prescriptions, isLoading: isLoadingPrescriptions } = useQuery({
    queryKey: ["/api/my-prescriptions"],
    enabled: activeContent === "dashboard" || activeContent === "prescriptions",
  });

  // Get all doctors for appointment booking
  const { data: doctors } = useQuery({
    queryKey: ["/api/doctors"],
    enabled: activeContent === "book-appointment",
  });

  const handleCancelAppointment = async (appointmentId: number) => {
    try {
      await apiRequest("PATCH", `/api/appointments/${appointmentId}`, { status: "cancelled" });
      toast({
        title: "Success",
        description: "Appointment cancelled successfully",
      });
      refetchAppointments();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel appointment",
        variant: "destructive",
      });
    }
  };
  
  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileUpdateData) => {
      const res = await apiRequest("PATCH", "/api/my-patient-profile", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      refetchProfile();
      setIsEditingProfile(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    }
  });
  
  // Initialize form with current patient profile
  const form = useForm<ProfileUpdateData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || null,
      phone: user?.phone || null,
      address: user?.address || null,
      medicalHistory: patientProfile?.medicalHistory || null,
      healthConditions: patientProfile?.healthConditions || null,
    }
  });
  
  // Handle profile form submission
  const onSubmit = (data: ProfileUpdateData) => {
    updateProfileMutation.mutate(data);
  };

  const sidebarLinks = [
    {
      title: "Services",
      links: [
        { 
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
            </svg>
          ), 
          text: "Dashboard", 
          active: activeContent === "dashboard",
          onClick: () => setActiveContent("dashboard")
        },
        { 
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
          ), 
          text: "Book Appointment", 
          active: activeContent === "book-appointment",
          onClick: () => setActiveContent("book-appointment")
        },
        { 
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v10H5V5z" />
              <path d="M11 11v4h4v-4h-4z" />
            </svg>
          ), 
          text: "My Appointments", 
          active: activeContent === "appointments",
          onClick: () => setActiveContent("appointments")
        },
        { 
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
          ), 
          text: "My Prescriptions", 
          active: activeContent === "prescriptions",
          onClick: () => setActiveContent("prescriptions")
        },
        { 
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
          ), 
          text: "Medical Records", 
          active: activeContent === "records",
          onClick: () => setActiveContent("records")
        },
        { 
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-.707.293l-3.525-3.525A2.5 2.5 0 0010.586 10H8.5a2.5 2.5 0 00-2.5 2.5V16H4V4zm3 9.5c0-.827.673-1.5 1.5-1.5h2.086a1.5 1.5 0 011.06.44L14 14.59V4a1 1 0 00-1-1H5a1 1 0 00-1 1v12a1 1 0 001 1h2v-3.5z" clipRule="evenodd" />
            </svg>
          ), 
          text: "Billing", 
          active: activeContent === "billing",
          onClick: () => setActiveContent("billing")
        },
      ]
    },
    {
      title: "Account",
      links: [
        { 
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
            </svg>
          ), 
          text: "My Profile", 
          active: activeContent === "profile",
          onClick: () => setActiveContent("profile")
        },
        { 
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
          ), 
          text: "Logout", 
          active: false,
          onClick: () => logoutMutation.mutate()
        },
      ]
    }
  ];

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderContent = () => {
    if (activeContent === "book-appointment") {
      return (
        <>
          <header className="bg-white shadow-sm p-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-800">Book an Appointment</h1>
            
            <div className="flex items-center">
              <span className="hidden md:inline-block text-sm text-gray-600 mr-4">{user?.fullName}</span>
              <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                {user?.fullName.split(" ").map(name => name[0]).join("").toUpperCase()}
              </div>
            </div>
          </header>
          
          <main className="p-6">
            <AppointmentBooking />
          </main>
        </>
      );
    }
    
    if (activeContent === "dashboard") {
      return (
        <>
          <header className="bg-white shadow-sm p-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-800">Patient Dashboard</h1>
            
            <div className="flex items-center">
              <span className="hidden md:inline-block text-sm text-gray-600 mr-4">{user?.fullName}</span>
              <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                {user?.fullName.split(" ").map(name => name[0]).join("").toUpperCase()}
              </div>
            </div>
          </header>
          
          <main className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h2 className="text-sm font-medium text-gray-500">Upcoming Appointment</h2>
                    {appointments && appointments.length > 0 ? (
                      <>
                        <p className="text-lg font-semibold text-gray-800">
                          {format(new Date(appointments[0].date), 'MMM d, yyyy - h:mm a')}
                        </p>
                        <p className="text-sm text-gray-600">
                          {appointments[0].doctor.user.fullName} ({appointments[0].doctor.department})
                        </p>
                      </>
                    ) : (
                      <p className="text-lg font-semibold text-gray-800">No upcoming appointments</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h2 className="text-sm font-medium text-gray-500">Prescriptions</h2>
                    <p className="text-lg font-semibold text-gray-800">
                      {prescriptions ? `${prescriptions.length} Active` : '0 Active'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {prescriptions && prescriptions.length > 0 
                        ? `Last updated: ${format(new Date(prescriptions[0].date), 'MMM d, yyyy')}`
                        : 'No recent prescriptions'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h2 className="text-sm font-medium text-gray-500">Billing</h2>
                    <p className="text-lg font-semibold text-gray-800">$0.00 Due</p>
                    <p className="text-sm text-gray-600">Last payment: N/A</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-800">Your Appointments</h2>
                  
                  <button 
                    onClick={() => setActiveContent("book-appointment")}
                    className="text-primary hover:text-blue-700 text-sm font-medium flex items-center"
                  >
                    Book New
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  {isLoadingAppointments ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : appointments && appointments.length > 0 ? (
                    appointments.slice(0, 3).map(appointment => (
                      <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-800">
                              {appointment.doctor.user.fullName} - {appointment.doctor.department}
                            </h3>
                            <div className="text-sm text-gray-500 mt-1">
                              <span className="inline-flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                                {format(new Date(appointment.date), 'MMM d, yyyy - h:mm a')}
                              </span>
                            </div>
                            <div className="mt-2 flex">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                ${appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                                 appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 
                                 appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                                 'bg-gray-100 text-gray-800'}`}>
                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                              </span>
                            </div>
                          </div>
                          
                          {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                            <button 
                              onClick={() => handleCancelAppointment(appointment.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      You have no appointments scheduled. Click "Book New" to schedule one.
                    </div>
                  )}
                  
                  {appointments && appointments.length > 3 && (
                    <div className="text-center mt-4">
                      <button 
                        onClick={() => setActiveContent("appointments")}
                        className="text-primary hover:text-blue-700 text-sm font-medium"
                      >
                        View All Appointments
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-800">Recent Prescriptions</h2>
                  
                  <button 
                    onClick={() => setActiveContent("prescriptions")}
                    className="text-primary hover:text-blue-700 text-sm font-medium flex items-center"
                  >
                    View All
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  {isLoadingPrescriptions ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : prescriptions && prescriptions.length > 0 ? (
                    prescriptions.slice(0, 3).map(prescription => (
                      <div key={prescription.id} className="border border-gray-200 rounded-lg p-4">
                        <div>
                          <div className="flex justify-between">
                            <h3 className="font-medium text-gray-800">{prescription.medicine}</h3>
                            <span className="text-sm text-gray-500">
                              {format(new Date(prescription.date), 'MMM d, yyyy')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{prescription.dosage}</p>
                          <div className="mt-2 flex">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {prescription.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-2">
                            Prescribed by: {prescription.doctor.user.fullName}
                          </p>
                          {prescription.instructions && (
                            <p className="text-sm text-gray-600 mt-1">
                              Instructions: {prescription.instructions}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      You have no prescriptions yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </>
      );
    }
    
    if (activeContent === "appointments") {
      return (
        <>
          <header className="bg-white shadow-sm p-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-800">My Appointments</h1>
            
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                {user?.fullName.split(" ").map(name => name[0]).join("").toUpperCase()}
              </div>
            </div>
          </header>
          
          <main className="p-6">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Your Appointments</h2>
                
                <button 
                  onClick={() => setActiveContent("book-appointment")}
                  className="bg-primary text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-600 transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Book New Appointment
                </button>
              </div>
              
              {isLoadingAppointments ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : appointments && appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.map(appointment => (
                    <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                        <div>
                          <h3 className="font-medium text-gray-800">{appointment.doctor.user.fullName}</h3>
                          <p className="text-sm text-gray-600">{appointment.doctor.department}</p>
                          <div className="text-sm text-gray-500 mt-2 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            {format(new Date(appointment.date), 'MMM d, yyyy - h:mm a')}
                          </div>
                          {appointment.notes && (
                            <p className="text-sm text-gray-600 mt-2 italic">
                              "{appointment.notes}"
                            </p>
                          )}
                          <div className="mt-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                              ${appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                               appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 
                               appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                               'bg-gray-100 text-gray-800'}`}>
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        
                        {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                          <button 
                            onClick={() => handleCancelAppointment(appointment.id)}
                            className="mt-3 md:mt-0 bg-white text-red-500 border border-red-300 px-3 py-1 rounded text-sm font-medium hover:bg-red-50 transition-colors flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Cancel Appointment
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments scheduled</h3>
                  <p className="text-gray-500 max-w-sm mx-auto mb-6">
                    You currently don't have any appointments scheduled. Click the button below to book your first appointment.
                  </p>
                  <button 
                    onClick={() => setActiveContent("book-appointment")}
                    className="bg-primary text-white px-6 py-2 rounded font-medium hover:bg-blue-600 transition-colors inline-flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Book an Appointment
                  </button>
                </div>
              )}
            </div>
          </main>
        </>
      );
    }
    
    if (activeContent === "prescriptions") {
      return (
        <>
          <header className="bg-white shadow-sm p-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-800">My Prescriptions</h1>
            
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                {user?.fullName.split(" ").map(name => name[0]).join("").toUpperCase()}
              </div>
            </div>
          </header>
          
          <main className="p-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">All Prescriptions</h2>
              
              {isLoadingPrescriptions ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : prescriptions && prescriptions.length > 0 ? (
                <div className="space-y-6">
                  {prescriptions.map(prescription => (
                    <div key={prescription.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                        <div>
                          <div className="flex items-center mb-2">
                            <h3 className="text-lg font-semibold text-gray-800">{prescription.medicine}</h3>
                            <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              prescription.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {prescription.status}
                            </span>
                          </div>
                          <p className="text-gray-600">{prescription.dosage}</p>
                          {prescription.instructions && (
                            <p className="text-gray-600 mt-2">Instructions: {prescription.instructions}</p>
                          )}
                          <div className="mt-4">
                            <p className="text-sm text-gray-500">
                              Prescribed by <span className="font-medium">{prescription.doctor.user.fullName}</span> ({prescription.doctor.department})
                            </p>
                            <p className="text-sm text-gray-500">
                              Date: {format(new Date(prescription.date), 'MMMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-4 md:mt-0 space-x-2">
                          <button className="bg-primary text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-600 transition-colors">
                            Download
                          </button>
                          <button className="border border-gray-300 text-gray-700 px-3 py-1 rounded text-sm font-medium hover:bg-gray-50 transition-colors">
                            Print
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  You have no prescriptions yet.
                </div>
              )}
            </div>
          </main>
        </>
      );
    }
    
    if (activeContent === "profile") {
      return (
        <>
          <header className="bg-white shadow-sm p-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-800">My Profile</h1>
            
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                {user?.fullName.split(" ").map(name => name[0]).join("").toUpperCase()}
              </div>
            </div>
          </header>
          
          <main className="p-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col md:flex-row md:items-center mb-6">
                <div className="h-24 w-24 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-bold mb-4 md:mb-0 md:mr-6">
                  {user?.fullName.split(" ").map(name => name[0]).join("").toUpperCase()}
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{user?.fullName}</h2>
                  <p className="text-gray-600">Patient</p>
                  <p className="text-gray-500 mt-1">Member since {user?.createdAt ? format(new Date(user.createdAt), 'MMMM yyyy') : 'N/A'}</p>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{patientProfile?.user.email}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{patientProfile?.user.phone}</p>
                  </div>
                  
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">{patientProfile?.user.address}</p>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Medical Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Medical History</p>
                    <p className="font-medium">{patientProfile?.medicalHistory || 'No medical history recorded'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Health Conditions</p>
                    <p className="font-medium">{patientProfile?.healthConditions || 'No health conditions recorded'}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                {isEditingProfile ? (
                  <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                          {...form.register("fullName")}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Enter your full name"
                        />
                        {form.formState.errors.fullName && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.fullName.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          {...form.register("email")}
                          type="email"
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Enter your email"
                        />
                        {form.formState.errors.email && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                          {...form.register("phone")}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Enter your phone number"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <input
                          {...form.register("address")}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Enter your address"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Medical History</label>
                      <textarea
                        {...form.register("medicalHistory")}
                        rows={3}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Enter your medical history"
                      ></textarea>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Health Conditions</label>
                      <textarea
                        {...form.register("healthConditions")}
                        rows={3}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Enter your health conditions, allergies, etc."
                      ></textarea>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        disabled={updateProfileMutation.isPending}
                        className="bg-primary text-white px-4 py-2 rounded font-medium hover:bg-blue-600 transition-colors"
                      >
                        {updateProfileMutation.isPending ? (
                          <div className="flex items-center">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Saving...
                          </div>
                        ) : "Save Changes"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded font-medium hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button 
                    onClick={() => setIsEditingProfile(true)}
                    className="bg-primary text-white px-4 py-2 rounded font-medium hover:bg-blue-600 transition-colors"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </main>
        </>
      );
    }
    
    // For records and billing, showing placeholder content
    return (
      <>
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">
            {activeContent === "records" ? "Medical Records" : "Billing"}
          </h1>
          
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
              {user?.fullName.split(" ").map(name => name[0]).join("").toUpperCase()}
            </div>
          </div>
        </header>
        
        <main className="p-6">
          <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center">
            <div className="text-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 className="text-xl font-medium text-gray-700 mb-2">
                {activeContent === "records" ? "No Medical Records Available" : "No Billing Information Available"}
              </h2>
              <p className="text-gray-500 max-w-md mx-auto">
                {activeContent === "records" 
                  ? "Your medical records will appear here once your doctor uploads them after an appointment."
                  : "Your billing information will appear here once you have any charges for services."}
              </p>
            </div>
          </div>
        </main>
      </>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <DashboardSidebar links={sidebarLinks} />
      
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default PatientDashboard;
