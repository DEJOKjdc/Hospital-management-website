import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { AddDoctorModal } from "@/components/add-doctor-modal";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

type ContentType = "doctors" | "patients" | "appointments";

const AdminDashboard = () => {
  const [activeContent, setActiveContent] = useState<ContentType>("doctors");
  const [isAddDoctorModalOpen, setIsAddDoctorModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();

  // Fetch doctors
  const { data: doctors, isLoading: isLoadingDoctors, refetch: refetchDoctors } = useQuery({
    queryKey: ["/api/doctors"],
    enabled: activeContent === "doctors",
  });

  // Fetch patients
  const { data: patients, isLoading: isLoadingPatients } = useQuery({
    queryKey: ["/api/patients"],
    enabled: activeContent === "patients",
  });

  const handleDeleteDoctor = async (doctorId: number) => {
    try {
      await apiRequest("DELETE", `/api/doctors/${doctorId}`);
      toast({
        title: "Success",
        description: "Doctor deleted successfully",
      });
      refetchDoctors();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete doctor",
        variant: "destructive",
      });
    }
  };

  const sidebarLinks = [
    {
      title: "Management",
      links: [
        { 
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
          ), 
          text: "Doctors List", 
          active: activeContent === "doctors",
          onClick: () => setActiveContent("doctors")
        },
        { 
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          ), 
          text: "Patients List", 
          active: activeContent === "patients",
          onClick: () => setActiveContent("patients")
        },
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
      ]
    },
    {
      title: "Settings",
      links: [
        { 
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          ), 
          text: "Settings", 
          active: false,
          onClick: () => {}
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

  // Filter doctors by search query
  const filteredDoctors = doctors?.filter(doctor => 
    doctor.user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter patients by search query
  const filteredPatients = patients?.filter(patient => 
    patient.user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.user.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContent = () => {
    if (activeContent === "doctors") {
      return (
        <>
          <header className="bg-white shadow-sm p-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-800">Doctors Management</h1>
            
            <div className="flex items-center">
              <span className="hidden md:inline-block text-sm text-gray-600 mr-4">Welcome, {user?.fullName}</span>
              <button 
                onClick={() => setIsAddDoctorModalOpen(true)}
                className="bg-primary text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add New Doctor
              </button>
            </div>
          </header>
          
          <main className="p-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Doctors List</h2>
                
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search doctors..." 
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                {isLoadingDoctors ? (
                  <div className="flex justify-center py-8">
                    <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Working Days</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredDoctors && filteredDoctors.length > 0 ? (
                        filteredDoctors.map((doctor) => {
                          const initials = doctor.user.fullName
                            .split(' ')
                            .map(name => name[0])
                            .join('')
                            .toUpperCase();
                            
                          // Generate a random-like color based on doctor id
                          const colors = ["primary", "secondary", "accent"];
                          const colorClass = `bg-${colors[doctor.id % colors.length]}`;
                            
                          return (
                            <tr key={doctor.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">D{doctor.id.toString().padStart(3, '0')}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 flex-shrink-0">
                                    <div className={`h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-bold`}>
                                      {initials}
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{doctor.user.fullName}</div>
                                    <div className="text-sm text-gray-500">{doctor.user.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doctor.department}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doctor.user.phone}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doctor.workingDays}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <a href="#" className="text-primary hover:text-blue-800 mr-3">Edit</a>
                                <button 
                                  onClick={() => handleDeleteDoctor(doctor.id)}
                                  className="text-red-500 hover:text-red-800"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                            {searchQuery ? "No doctors found matching your search" : "No doctors found"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </main>
        </>
      );
    }
    
    if (activeContent === "patients") {
      return (
        <>
          <header className="bg-white shadow-sm p-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-800">Patients Management</h1>
            
            <div className="flex items-center">
              <span className="hidden md:inline-block text-sm text-gray-600 mr-4">Welcome, {user?.fullName}</span>
            </div>
          </header>
          
          <main className="p-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Patients List</h2>
                
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search patients..." 
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                {isLoadingPatients ? (
                  <div className="flex justify-center py-8">
                    <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medical History</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPatients && filteredPatients.length > 0 ? (
                        filteredPatients.map((patient) => {
                          const initials = patient.user.fullName
                            .split(' ')
                            .map(name => name[0])
                            .join('')
                            .toUpperCase();
                            
                          return (
                            <tr key={patient.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">P{patient.id.toString().padStart(3, '0')}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 flex-shrink-0">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 text-primary flex items-center justify-center font-bold">
                                      {initials}
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{patient.user.fullName}</div>
                                    <div className="text-sm text-gray-500">{patient.user.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.user.phone}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.user.address}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.medicalHistory || "No history recorded"}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <a href="#" className="text-primary hover:text-blue-800 mr-3">View Details</a>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                            {searchQuery ? "No patients found matching your search" : "No patients found"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
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
            <h1 className="text-xl font-semibold text-gray-800">Appointments Management</h1>
            
            <div className="flex items-center">
              <span className="hidden md:inline-block text-sm text-gray-600 mr-4">Welcome, {user?.fullName}</span>
            </div>
          </header>
          
          <main className="p-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">All Appointments</h2>
              
              <div className="flex justify-center py-8">
                <p className="text-gray-500">Appointments management is under development.</p>
              </div>
            </div>
          </main>
        </>
      );
    }
    
    return null;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <DashboardSidebar links={sidebarLinks} />
      
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
      
      {isAddDoctorModalOpen && (
        <AddDoctorModal 
          onClose={() => setIsAddDoctorModalOpen(false)} 
          onSuccess={() => {
            setIsAddDoctorModalOpen(false);
            refetchDoctors();
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
