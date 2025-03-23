import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

type ContentType = "appointments" | "patients" | "prescriptions" | "profile";

const DoctorDashboard = () => {
  const [activeContent, setActiveContent] = useState<ContentType>("appointments");
  const { user, logoutMutation } = useAuth();

  // Get doctor profile
  const { data: doctorProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["/api/my-doctor-profile"],
  });

  // Get doctor's appointments
  const { data: appointments, isLoading: isLoadingAppointments } = useQuery({
    queryKey: ["/api/my-appointments"],
    enabled: activeContent === "appointments" || activeContent === "patients",
  });

  const sidebarLinks = [
    {
      title: "Management",
      links: [
        { 
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
          ), 
          text: "Appointments", 
          active: activeContent === "appointments",
          onClick: () => setActiveContent("appointments")
        },
        { 
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          ), 
          text: "My Patients", 
          active: activeContent === "patients",
          onClick: () => setActiveContent("patients")
        },
        { 
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          ), 
          text: "Prescriptions", 
          active: activeContent === "prescriptions",
          onClick: () => setActiveContent("prescriptions")
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
    if (activeContent === "appointments") {
      return (
        <>
          <header className="bg-white shadow-sm p-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-800">Today's Appointments</h1>
            
            <div className="flex items-center">
              <span className="hidden md:inline-block text-sm text-gray-600 mr-4">{user?.fullName}</span>
              <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                {user?.fullName.split(" ").map(name => name[0]).join("").toUpperCase()}
              </div>
            </div>
          </header>
          
          <main className="p-6">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Upcoming Appointments</h2>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 border border-gray-300 rounded">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  <span className="text-sm font-medium">Today, {format(new Date(), 'MMMM d')}</span>
                  
                  <button className="p-2 border border-gray-300 rounded">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                {isLoadingAppointments ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : appointments && appointments.length > 0 ? (
                  appointments.map(appointment => {
                    const patientInitials = appointment.patient.user.fullName
                      .split(' ')
                      .map(name => name[0])
                      .join('')
                      .toUpperCase();
                      
                    return (
                      <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="h-12 w-12 rounded-full bg-blue-100 text-primary flex items-center justify-center font-bold">
                            {patientInitials}
                          </div>
                          <div className="ml-4">
                            <h3 className="font-medium text-gray-800">{appointment.patient.user.fullName}</h3>
                            <div className="text-sm text-gray-500">
                              <span className="inline-flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                                {format(new Date(appointment.date), 'hh:mm a')}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                            ${appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : 
                             appointment.status === 'completed' ? 'bg-green-100 text-green-800' : 
                             appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                             'bg-orange-100 text-orange-800'}`}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                          <button className="text-sm font-medium text-primary hover:text-blue-700">
                            View Details
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No appointments scheduled for today.
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Patients</h2>
                
                <div className="space-y-4">
                  {appointments && appointments.length > 0 ? (
                    [...new Map(appointments.map(item => [item.patient.id, item])).values()].slice(0, 3).map(appointment => {
                      const patientInitials = appointment.patient.user.fullName
                        .split(' ')
                        .map(name => name[0])
                        .join('')
                        .toUpperCase();
                        
                      return (
                        <div key={appointment.patient.id} className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 text-primary flex items-center justify-center font-bold">
                            {patientInitials}
                          </div>
                          <div className="ml-3">
                            <h3 className="font-medium text-gray-800">{appointment.patient.user.fullName}</h3>
                            <p className="text-sm text-gray-500">Last visit: {format(new Date(appointment.date), 'MMM d, yyyy')}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No recent patients.
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <button className="p-4 border border-gray-200 rounded-lg flex flex-col items-center justify-center hover:bg-gray-50 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary mb-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-gray-800">New Prescription</span>
                  </button>
                  
                  <button className="p-4 border border-gray-200 rounded-lg flex flex-col items-center justify-center hover:bg-gray-50 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary mb-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-gray-800">Patient History</span>
                  </button>
                  
                  <button className="p-4 border border-gray-200 rounded-lg flex flex-col items-center justify-center hover:bg-gray-50 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary mb-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-gray-800">Medical Reports</span>
                  </button>
                  
                  <button className="p-4 border border-gray-200 rounded-lg flex flex-col items-center justify-center hover:bg-gray-50 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary mb-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-gray-800">Send Message</span>
                  </button>
                </div>
              </div>
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
                  <p className="text-gray-600">{doctorProfile?.department}</p>
                  <p className="text-gray-500 mt-1">Working days: {doctorProfile?.workingDays}</p>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{doctorProfile?.user.email}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{doctorProfile?.user.phone}</p>
                  </div>
                  
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">{doctorProfile?.user.address}</p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </>
      );
    }
    
    // You can add more content views as needed
    
    return (
      <div className="flex items-center justify-center p-6 h-full">
        <p className="text-gray-500 text-lg">This section is under development.</p>
      </div>
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

export default DoctorDashboard;
