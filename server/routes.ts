import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  doctorCreationSchema, 
  insertAppointmentSchema, 
  insertPrescriptionSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  const { isAuthenticated } = setupAuth(app);

  // Get all doctors
  app.get("/api/doctors", async (req, res) => {
    try {
      const doctors = await storage.getAllDoctors();
      res.status(200).json(doctors);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      res.status(500).json({ message: "Failed to fetch doctors" });
    }
  });

  // Get a specific doctor
  app.get("/api/doctors/:id", async (req, res) => {
    try {
      const doctor = await storage.getDoctorById(parseInt(req.params.id));
      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }
      res.status(200).json(doctor);
    } catch (error) {
      console.error("Error fetching doctor:", error);
      res.status(500).json({ message: "Failed to fetch doctor" });
    }
  });

  // Admin route to create a new doctor
  app.post("/api/doctors", isAuthenticated, async (req, res) => {
    // Check if user is admin
    if (req.session.userRole !== "admin") {
      return res.status(403).json({ message: "Only admin can create doctors" });
    }

    try {
      const validatedData = doctorCreationSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Create user
      const user = await storage.createUser({
        username: validatedData.username,
        password: validatedData.password,
        role: "doctor",
        fullName: validatedData.fullName,
        email: validatedData.email,
        phone: validatedData.phone,
        address: validatedData.address,
      });

      // Create doctor
      const doctor = await storage.createDoctor({
        userId: user.id,
        department: validatedData.department,
        workingDays: validatedData.workingDays,
      });

      // Return combined doctor data
      const doctorWithUser = await storage.getDoctorById(doctor.id);
      
      res.status(201).json(doctorWithUser);
    } catch (error) {
      console.error("Error creating doctor:", error);
      res.status(500).json({ message: "Failed to create doctor" });
    }
  });

  // Get all patients (admin only)
  app.get("/api/patients", isAuthenticated, async (req, res) => {
    // Check if user is admin
    if (req.session.userRole !== "admin") {
      return res.status(403).json({ message: "Only admin can view all patients" });
    }

    try {
      const patients = await storage.getAllPatients();
      res.status(200).json(patients);
    } catch (error) {
      console.error("Error fetching patients:", error);
      res.status(500).json({ message: "Failed to fetch patients" });
    }
  });

  // Get current patient's details
  app.get("/api/my-patient-profile", isAuthenticated, async (req, res) => {
    if (req.session.userRole !== "patient") {
      return res.status(403).json({ message: "Only patients can access this resource" });
    }

    try {
      const patient = await storage.getPatientByUserId(req.session.userId!);
      if (!patient) {
        return res.status(404).json({ message: "Patient profile not found" });
      }
      res.status(200).json(patient);
    } catch (error) {
      console.error("Error fetching patient profile:", error);
      res.status(500).json({ message: "Failed to fetch patient profile" });
    }
  });

  // Get current doctor's details
  app.get("/api/my-doctor-profile", isAuthenticated, async (req, res) => {
    if (req.session.userRole !== "doctor") {
      return res.status(403).json({ message: "Only doctors can access this resource" });
    }

    try {
      const doctor = await storage.getDoctorByUserId(req.session.userId!);
      if (!doctor) {
        return res.status(404).json({ message: "Doctor profile not found" });
      }
      res.status(200).json(doctor);
    } catch (error) {
      console.error("Error fetching doctor profile:", error);
      res.status(500).json({ message: "Failed to fetch doctor profile" });
    }
  });

  // Get doctor's appointments
  app.get("/api/doctors/:id/appointments", isAuthenticated, async (req, res) => {
    const doctorId = parseInt(req.params.id);
    
    try {
      // Check if current user is this doctor or an admin
      if (req.session.userRole === "doctor") {
        const currentDoctorProfile = await storage.getDoctorByUserId(req.session.userId!);
        if (!currentDoctorProfile || currentDoctorProfile.id !== doctorId) {
          return res.status(403).json({ message: "You can only view your own appointments" });
        }
      } else if (req.session.userRole !== "admin") {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const appointments = await storage.getAppointmentsByDoctorId(doctorId);
      res.status(200).json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  // Get patient's appointments
  app.get("/api/patients/:id/appointments", isAuthenticated, async (req, res) => {
    const patientId = parseInt(req.params.id);
    
    try {
      // Check if current user is this patient, a doctor treating this patient, or an admin
      if (req.session.userRole === "patient") {
        const currentPatientProfile = await storage.getPatientByUserId(req.session.userId!);
        if (!currentPatientProfile || currentPatientProfile.id !== patientId) {
          return res.status(403).json({ message: "You can only view your own appointments" });
        }
      } else if (req.session.userRole !== "admin" && req.session.userRole !== "doctor") {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const appointments = await storage.getAppointmentsByPatientId(patientId);
      res.status(200).json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  // Get my appointments (for the current logged-in user)
  app.get("/api/my-appointments", isAuthenticated, async (req, res) => {
    try {
      if (req.session.userRole === "doctor") {
        const doctor = await storage.getDoctorByUserId(req.session.userId!);
        if (!doctor) {
          return res.status(404).json({ message: "Doctor profile not found" });
        }
        
        const appointments = await storage.getAppointmentsByDoctorId(doctor.id);
        return res.status(200).json(appointments);
      } 
      
      if (req.session.userRole === "patient") {
        const patient = await storage.getPatientByUserId(req.session.userId!);
        if (!patient) {
          return res.status(404).json({ message: "Patient profile not found" });
        }
        
        const appointments = await storage.getAppointmentsByPatientId(patient.id);
        return res.status(200).json(appointments);
      }
      
      return res.status(403).json({ message: "Invalid user role" });
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  // Book a new appointment
  app.post("/api/appointments", isAuthenticated, async (req, res) => {
    if (req.session.userRole !== "patient") {
      return res.status(403).json({ message: "Only patients can book appointments" });
    }

    try {
      const patient = await storage.getPatientByUserId(req.session.userId!);
      if (!patient) {
        return res.status(404).json({ message: "Patient profile not found" });
      }

      // Validate doctor exists
      const doctor = await storage.getDoctorById(req.body.doctorId);
      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }

      // Check if the selected time slot is available
      const appointmentDate = new Date(req.body.date);
      const existingAppointments = await storage.getAppointmentsByDoctorId(req.body.doctorId);
      
      // Check for conflicts in time slots (appointments in the same hour)
      const hasConflict = existingAppointments.some(existing => {
        const existingDate = new Date(existing.date);
        return (
          existingDate.getFullYear() === appointmentDate.getFullYear() &&
          existingDate.getMonth() === appointmentDate.getMonth() &&
          existingDate.getDate() === appointmentDate.getDate() &&
          existingDate.getHours() === appointmentDate.getHours()
        );
      });

      if (hasConflict) {
        return res.status(409).json({ message: "This time slot is no longer available" });
      }

      // All doctors work every day, no need to check

      // Create appointment data with the correct types
      const appointmentData = {
        doctorId: parseInt(req.body.doctorId),
        date: appointmentDate, // Use the already parsed date object
        patientId: patient.id,
        status: "scheduled",
        notes: req.body.notes || null
      };
      
      // Skip Zod validation since we're already handling the parsing manually
      const appointment = await storage.createAppointment(appointmentData);
      res.status(201).json(appointment);
    } catch (error) {
      console.error("Error booking appointment:", error);
      res.status(500).json({ message: "Failed to book appointment" });
    }
  });

  // Update appointment status
  app.patch("/api/appointments/:id", isAuthenticated, async (req, res) => {
    const appointmentId = parseInt(req.params.id);
    
    try {
      const appointment = await storage.getAppointmentById(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      // Check permissions: patients can only cancel their own appointments
      if (req.session.userRole === "patient") {
        const patient = await storage.getPatientByUserId(req.session.userId!);
        if (!patient || patient.id !== appointment.patientId) {
          return res.status(403).json({ message: "You can only update your own appointments" });
        }
        
        // Patients can only change status to cancelled
        if (req.body.status && req.body.status !== "cancelled") {
          return res.status(403).json({ message: "Patients can only cancel appointments" });
        }
      } 
      // Doctors can update only their own appointments
      else if (req.session.userRole === "doctor") {
        const doctor = await storage.getDoctorByUserId(req.session.userId!);
        if (!doctor || doctor.id !== appointment.doctorId) {
          return res.status(403).json({ message: "You can only update your own appointments" });
        }
      }
      // Admin can update any appointment
      else if (req.session.userRole !== "admin") {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const updatedAppointment = await storage.updateAppointment(appointmentId, req.body);
      res.status(200).json(updatedAppointment);
    } catch (error) {
      console.error("Error updating appointment:", error);
      res.status(500).json({ message: "Failed to update appointment" });
    }
  });

  // Get all prescriptions for current patient
  app.get("/api/my-prescriptions", isAuthenticated, async (req, res) => {
    if (req.session.userRole !== "patient") {
      return res.status(403).json({ message: "Only patients can access their prescriptions" });
    }

    try {
      const patient = await storage.getPatientByUserId(req.session.userId!);
      if (!patient) {
        return res.status(404).json({ message: "Patient profile not found" });
      }
      
      const prescriptions = await storage.getPrescriptionsByPatientId(patient.id);
      res.status(200).json(prescriptions);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      res.status(500).json({ message: "Failed to fetch prescriptions" });
    }
  });

  // Get all prescriptions by doctor
  app.get("/api/doctors/:id/prescriptions", isAuthenticated, async (req, res) => {
    const doctorId = parseInt(req.params.id);
    
    try {
      // Check if current user is this doctor or an admin
      if (req.session.userRole === "doctor") {
        const currentDoctorProfile = await storage.getDoctorByUserId(req.session.userId!);
        if (!currentDoctorProfile || currentDoctorProfile.id !== doctorId) {
          return res.status(403).json({ message: "You can only view your own prescriptions" });
        }
      } else if (req.session.userRole !== "admin") {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const prescriptions = await storage.getPrescriptionsByDoctorId(doctorId);
      res.status(200).json(prescriptions);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      res.status(500).json({ message: "Failed to fetch prescriptions" });
    }
  });

  // Add a new prescription
  app.post("/api/prescriptions", isAuthenticated, async (req, res) => {
    if (req.session.userRole !== "doctor") {
      return res.status(403).json({ message: "Only doctors can add prescriptions" });
    }

    try {
      const doctor = await storage.getDoctorByUserId(req.session.userId!);
      if (!doctor) {
        return res.status(404).json({ message: "Doctor profile not found" });
      }

      const validatedData = insertPrescriptionSchema.parse({
        ...req.body,
        doctorId: doctor.id,
        date: new Date(),
        status: "active"
      });

      const prescription = await storage.createPrescription(validatedData);
      res.status(201).json(prescription);
    } catch (error) {
      console.error("Error adding prescription:", error);
      res.status(500).json({ message: "Failed to add prescription" });
    }
  });

  // Update patient profile
  app.patch("/api/my-patient-profile", isAuthenticated, async (req, res) => {
    if (req.session.userRole !== "patient") {
      return res.status(403).json({ message: "Only patients can update their profile" });
    }

    try {
      // Define validation schema for profile update
      const profileUpdateSchema = z.object({
        fullName: z.string().min(2, "Full name must be at least 2 characters").optional(),
        email: z.string().email("Please enter a valid email").nullable().optional(),
        phone: z.string().nullable().optional(),
        address: z.string().nullable().optional(),
        medicalHistory: z.string().nullable().optional(),
        healthConditions: z.string().nullable().optional(),
      });

      const validatedData = profileUpdateSchema.parse(req.body);
      
      // Get patient profile
      const patient = await storage.getPatientByUserId(req.session.userId!);
      if (!patient) {
        return res.status(404).json({ message: "Patient profile not found" });
      }

      // Update user information if provided
      const userUpdateData: any = {};
      if (validatedData.fullName) userUpdateData.fullName = validatedData.fullName;
      if (validatedData.email !== undefined) userUpdateData.email = validatedData.email;
      if (validatedData.phone !== undefined) userUpdateData.phone = validatedData.phone;
      if (validatedData.address !== undefined) userUpdateData.address = validatedData.address;
      
      // Only update user data if there's something to update
      if (Object.keys(userUpdateData).length > 0) {
        await storage.updateUser(patient.user.id, userUpdateData);
      }

      // Update patient information if provided
      const patientUpdateData: any = {};
      if (validatedData.medicalHistory !== undefined) patientUpdateData.medicalHistory = validatedData.medicalHistory;
      if (validatedData.healthConditions !== undefined) patientUpdateData.healthConditions = validatedData.healthConditions;
      
      // Only update patient data if there's something to update
      if (Object.keys(patientUpdateData).length > 0) {
        await storage.updatePatient(patient.id, patientUpdateData);
      }

      // Get updated patient profile
      const updatedPatient = await storage.getPatientByUserId(req.session.userId!);
      res.status(200).json(updatedPatient);
    } catch (error) {
      console.error("Error updating patient profile:", error);
      res.status(500).json({ message: "Failed to update patient profile" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
