import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Doctor creation schema
const doctorCreationSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(3, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is required"),
  address: z.string().min(5, "Address is required"),
  department: z.string().min(1, "Department is required"),
  workingDays: z.string().min(1, "Working days are required"),
});

type DoctorCreationFormData = z.infer<typeof doctorCreationSchema>;

type AddDoctorModalProps = {
  onClose: () => void;
  onSuccess: () => void;
};

export const AddDoctorModal = ({ onClose, onSuccess }: AddDoctorModalProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm<DoctorCreationFormData>({
    resolver: zodResolver(doctorCreationSchema)
  });

  const onSubmit = async (data: DoctorCreationFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Format working days from checkboxes
      const workingDaysArray: string[] = [];
      if (data.workingDays.includes("Monday")) workingDaysArray.push("Mon");
      if (data.workingDays.includes("Tuesday")) workingDaysArray.push("Tue");
      if (data.workingDays.includes("Wednesday")) workingDaysArray.push("Wed");
      if (data.workingDays.includes("Thursday")) workingDaysArray.push("Thu");
      if (data.workingDays.includes("Friday")) workingDaysArray.push("Fri");
      if (data.workingDays.includes("Saturday")) workingDaysArray.push("Sat");
      if (data.workingDays.includes("Sunday")) workingDaysArray.push("Sun");
      
      const formattedData = {
        ...data,
        workingDays: workingDaysArray.join(", ")
      };
      
      await apiRequest("POST", "/api/doctors", formattedData);
      
      toast({
        title: "Success",
        description: "Doctor added successfully",
      });
      
      onSuccess();
    } catch (error) {
      console.error("Error adding doctor:", error);
      setError("Failed to add doctor. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="text-xl font-bold text-gray-800 mb-6">Add New Doctor</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="doctor-name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              id="doctor-name"
              {...register("fullName")}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter doctor's full name"
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="doctor-username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              id="doctor-username"
              {...register("username")}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Choose a username"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="doctor-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="doctor-email"
              type="email"
              {...register("email")}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter doctor's email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="doctor-department" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              id="doctor-department"
              {...register("department")}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Select Department</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Neurology">Neurology</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="Dermatology">Dermatology</option>
              <option value="Ophthalmology">Ophthalmology</option>
              <option value="ENT">ENT</option>
              <option value="Psychiatry">Psychiatry</option>
            </select>
            {errors.department && (
              <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="doctor-phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              id="doctor-phone"
              type="tel"
              {...register("phone")}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter doctor's phone number"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="doctor-address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              id="doctor-address"
              {...register("address")}
              rows={2}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter doctor's address"
            ></textarea>
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Working Days</label>
            <div className="grid grid-cols-4 gap-2">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  value="Monday"
                  {...register("workingDays")}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Mon</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  value="Tuesday"
                  {...register("workingDays")}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Tue</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  value="Wednesday"
                  {...register("workingDays")}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Wed</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  value="Thursday"
                  {...register("workingDays")}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Thu</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  value="Friday"
                  {...register("workingDays")}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Fri</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  value="Saturday"
                  {...register("workingDays")}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Sat</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  value="Sunday"
                  {...register("workingDays")}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Sun</span>
              </label>
            </div>
            {errors.workingDays && (
              <p className="mt-1 text-sm text-red-600">{errors.workingDays.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="doctor-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              id="doctor-password"
              type="password"
              {...register("password")}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Set a password"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>
          
          {error && (
            <div className="text-red-500 text-sm">
              {error}
            </div>
          )}
          
          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg mr-2 hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Add Doctor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
