import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, isAfter, isBefore, addDays, parseISO, setHours, setMinutes, addHours } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Calendar as CalendarIcon, Clock, CheckCircle } from "lucide-react";
import { addToGoogleCalendar, isGoogleAuthenticated, authenticateWithGoogle } from "@/lib/google-calendar";

// Available time slots
const TIME_SLOTS = [
  "09:00", "10:00", "11:00", "14:00", 
  "15:00", "16:00", "17:00", "18:00"
];

// Appointment booking schema
const appointmentSchema = z.object({
  doctorId: z.number().positive("Please select a doctor"),
  date: z.date({
    required_error: "Please select a date",
  }),
  timeSlot: z.string().min(1, "Please select a time slot"),
  notes: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

export const AppointmentBooking = () => {
  const { toast } = useToast();
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<string[]>(TIME_SLOTS);
  const [addToCalendar, setAddToCalendar] = useState<boolean>(false);
  const [calendarSuccess, setCalendarSuccess] = useState<boolean | null>(null);
  
  const { register, handleSubmit, control, watch, setValue, formState: { errors }, reset } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      notes: "",
    },
  });
  
  // Get doctor selection from form
  const selectedDoctor = watch("doctorId");
  const selectedDate = watch("date");
  
  // Get all doctors
  const { data: doctors, isLoading: isLoadingDoctors } = useQuery({
    queryKey: ["/api/doctors"],
  });

  // Get doctor's existing appointments to check availability
  const { data: doctorAppointments, isLoading: isLoadingAppointments } = useQuery({
    queryKey: ["/api/doctor-appointments", selectedDoctor],
    enabled: !!selectedDoctor,
    queryFn: async () => {
      if (!selectedDoctor) return [];
      const res = await apiRequest("GET", `/api/doctors/${selectedDoctor}/appointments`);
      return await res.json();
    },
  });

  // Filter doctors by department
  const filteredDoctors = doctors?.filter(doctor => 
    !departmentFilter || doctor.department.toLowerCase().includes(departmentFilter.toLowerCase())
  );

  // Handle form submission
  const bookAppointmentMutation = useMutation({
    mutationFn: async (data: AppointmentFormData) => {
      // Format date and time for the API
      const hours = parseInt(data.timeSlot.split(":")[0]);
      const minutes = parseInt(data.timeSlot.split(":")[1] || "0");
      
      // Create a new Date object from the selected date and set hours and minutes
      const appointmentDateTime = new Date(data.date);
      appointmentDateTime.setHours(hours);
      appointmentDateTime.setMinutes(minutes);
      
      const appointmentData = {
        doctorId: data.doctorId,
        date: appointmentDateTime.toISOString(),
        notes: data.notes || "Regular checkup",
      };
      
      const res = await apiRequest("POST", "/api/appointments", appointmentData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-appointments"] });
      toast({
        title: "Success",
        description: "Appointment booked successfully",
      });
      reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Booking failed",
        description: error.message || "Could not book the appointment",
        variant: "destructive",
      });
    },
  });

  // Watch for changes in selected doctor and date to update available time slots
  useEffect(() => {
    if (selectedDoctor && selectedDate && doctorAppointments) {
      // Filter out already booked time slots
      const bookedSlots = doctorAppointments
        .filter(appointment => 
          format(new Date(appointment.date), "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
        )
        .map(appointment => format(new Date(appointment.date), "HH:mm"));
      
      const available = TIME_SLOTS.filter(slot => !bookedSlots.includes(slot));
      setAvailableSlots(available);
      
      // If current selection is no longer available, reset it
      if (watch("timeSlot") && !available.includes(watch("timeSlot"))) {
        setValue("timeSlot", "");
      }
    } else {
      setAvailableSlots(TIME_SLOTS);
    }
  }, [selectedDoctor, selectedDate, doctorAppointments, setValue, watch]);

  const handleGoogleCalendarIntegration = async (data: AppointmentFormData, selectedDoctorData: any) => {
    if (!addToCalendar) return;
    
    setCalendarSuccess(null);
    
    // Check if already authenticated with Google
    const isAuthenticated = isGoogleAuthenticated();
    
    if (!isAuthenticated) {
      // Authenticate with Google first
      const authSuccess = await authenticateWithGoogle();
      if (!authSuccess) {
        toast({
          title: "Google Calendar Error",
          description: "Failed to authenticate with Google Calendar",
          variant: "destructive",
        });
        return;
      }
    }
    
    // Format the appointment data for Google Calendar
    const hours = parseInt(data.timeSlot.split(":")[0]);
    const minutes = parseInt(data.timeSlot.split(":")[1] || "0");
    
    // Create a new Date object from the selected date and set hours and minutes
    const appointmentDateTime = new Date(data.date);
    appointmentDateTime.setHours(hours);
    appointmentDateTime.setMinutes(minutes);
    
    const appointmentEndTime = addHours(appointmentDateTime, 1);
    
    const calendarEvent = {
      summary: `Medical Appointment with Dr. ${selectedDoctorData.user.fullName}`,
      description: data.notes || "Regular checkup",
      startTime: appointmentDateTime,
      endTime: appointmentEndTime,
      location: `${selectedDoctorData.department} Department, Hospital`
    };
    
    // Add to Google Calendar
    const calendarSuccess = await addToGoogleCalendar(calendarEvent);
    
    if (calendarSuccess) {
      setCalendarSuccess(true);
      toast({
        title: "Calendar Updated",
        description: "Appointment added to your Google Calendar",
      });
    } else {
      setCalendarSuccess(false);
      toast({
        title: "Calendar Error",
        description: "Failed to add appointment to Google Calendar",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: AppointmentFormData) => {
    bookAppointmentMutation.mutate(data);
    
    // Handle Google Calendar integration if checkbox is checked
    if (addToCalendar && selectedDoctor) {
      const selectedDoctorData = doctors?.find(doc => doc.id === selectedDoctor);
      if (selectedDoctorData) {
        await handleGoogleCalendarIntegration(data, selectedDoctorData);
      }
    }
  };

  // Check if a date is disabled (past date or non-working day for the selected doctor)
  const isDateDisabled = (date: Date) => {
    // Disable past dates
    if (isBefore(date, new Date())) {
      return true;
    }
    
    // Disable dates more than 30 days in the future
    if (isAfter(date, addDays(new Date(), 30))) {
      return true;
    }
    
    // If no doctor is selected, don't apply further restrictions
    if (!selectedDoctor) {
      return false;
    }
    
    // All doctors work every day
    return false;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Book an Appointment</h2>
      
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Department
            </label>
            <input
              type="text"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              placeholder="E.g. Cardiology, Neurology"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                min={format(new Date(), "yyyy-MM-dd")}
                max={format(addDays(new Date(), 30), "yyyy-MM-dd")}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <CalendarIcon className="h-5 w-5 text-gray-400 absolute right-3 top-2.5" />
            </div>
          </div>
        </div>
      </div>
      
      {isLoadingDoctors ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredDoctors && filteredDoctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {filteredDoctors.map((doctor) => {
            // All doctors work every day, so no date filtering needed
            
            const isSelected = selectedDoctor === doctor.id;
            
            return (
              <div 
                key={doctor.id}
                onClick={() => setValue("doctorId", doctor.id)}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                    {doctor.user.fullName.split(' ').map(name => name[0]).join('').toUpperCase()}
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium text-gray-800">{doctor.user.fullName}</h3>
                    <p className="text-sm text-gray-500">{doctor.department}</p>
                    <p className="text-xs text-gray-400 mt-1">Available every day</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No doctors found matching your criteria
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Hidden doctor ID field */}
        <input type="hidden" {...register("doctorId")} />
        {errors.doctorId && (
          <p className="text-sm text-red-600">{errors.doctorId.message}</p>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Appointment Date
            </label>
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <input
                    type="date"
                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                    value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                    min={format(new Date(), "yyyy-MM-dd")}
                    max={format(addDays(new Date(), 30), "yyyy-MM-dd")}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <CalendarIcon className="h-5 w-5 text-gray-400 absolute right-3 top-2.5" />
                </div>
              )}
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Slot
            </label>
            <div className="relative">
              <select
                {...register("timeSlot")}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                disabled={!selectedDoctor || !selectedDate}
              >
                <option value="">Select a time slot</option>
                {availableSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot.split(":")[0]}:{slot.split(":")[1]} - {parseInt(slot.split(":")[0]) + 1}:00
                  </option>
                ))}
              </select>
              <Clock className="h-5 w-5 text-gray-400 absolute right-3 top-2.5" />
            </div>
            {errors.timeSlot && (
              <p className="mt-1 text-sm text-red-600">{errors.timeSlot.message}</p>
            )}
            {availableSlots.length === 0 && selectedDoctor && selectedDate && (
              <p className="mt-1 text-sm text-amber-600">No available slots for this day</p>
            )}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            {...register("notes")}
            rows={3}
            placeholder="Describe your symptoms or reason for visit"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          ></textarea>
        </div>
        
        {/* Google Calendar integration checkbox */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="add-to-calendar"
              checked={addToCalendar}
              onChange={(e) => setAddToCalendar(e.target.checked)}
              className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="add-to-calendar" className="ml-2 block text-sm text-gray-700">
              Add to my Google Calendar
            </label>
          </div>
          
          {calendarSuccess === true && (
            <div className="flex items-center text-green-600 text-sm">
              <CheckCircle className="h-4 w-4 mr-1" />
              Added to Calendar
            </div>
          )}
          
          {calendarSuccess === false && (
            <div className="flex items-center text-red-600 text-sm">
              <span className="mr-1">×</span>
              Failed to add to Calendar
            </div>
          )}
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={bookAppointmentMutation.isPending || !selectedDoctor || !selectedDate}
            className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
          >
            {bookAppointmentMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Book Appointment
          </button>
        </div>
      </form>
    </div>
  );
};