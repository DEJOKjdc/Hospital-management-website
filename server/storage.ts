import session from "express-session";
import createMemoryStore from "memorystore";
import { 
  User, InsertUser, Doctor, InsertDoctor, Patient, InsertPatient,
  Appointment, InsertAppointment, Prescription, InsertPrescription,
  DoctorWithUser, PatientWithUser, AppointmentWithDetails, PrescriptionWithDetails
} from "@shared/schema";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // Session store
  sessionStore: session.Store;
  
  // User methods
  getUserById(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  
  // Doctor methods
  getDoctorById(id: number): Promise<DoctorWithUser | undefined>;
  getDoctorByUserId(userId: number): Promise<DoctorWithUser | undefined>;
  getAllDoctors(): Promise<DoctorWithUser[]>;
  createDoctor(doctor: InsertDoctor): Promise<Doctor>;
  
  // Patient methods
  getPatientById(id: number): Promise<PatientWithUser | undefined>;
  getPatientByUserId(userId: number): Promise<PatientWithUser | undefined>;
  getAllPatients(): Promise<PatientWithUser[]>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: number, data: Partial<Patient>): Promise<Patient | undefined>;
  
  // Appointment methods
  getAppointmentById(id: number): Promise<AppointmentWithDetails | undefined>;
  getAppointmentsByDoctorId(doctorId: number): Promise<AppointmentWithDetails[]>;
  getAppointmentsByPatientId(patientId: number): Promise<AppointmentWithDetails[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, data: Partial<Appointment>): Promise<Appointment | undefined>;
  
  // Prescription methods
  getPrescriptionById(id: number): Promise<PrescriptionWithDetails | undefined>;
  getPrescriptionsByDoctorId(doctorId: number): Promise<PrescriptionWithDetails[]>;
  getPrescriptionsByPatientId(patientId: number): Promise<PrescriptionWithDetails[]>;
  createPrescription(prescription: InsertPrescription): Promise<Prescription>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private doctors: Map<number, Doctor>;
  private patients: Map<number, Patient>;
  private appointments: Map<number, Appointment>;
  private prescriptions: Map<number, Prescription>;
  
  sessionStore: session.Store;
  
  private userId: number = 1;
  private doctorId: number = 1;
  private patientId: number = 1;
  private appointmentId: number = 1;
  private prescriptionId: number = 1;

  constructor() {
    this.users = new Map();
    this.doctors = new Map();
    this.patients = new Map();
    this.appointments = new Map();
    this.prescriptions = new Map();
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    
    this.initializeDefaultData();
  }

  // Initialize default data - admin, 3 doctors, 3 patients
  private initializeDefaultData() {
    // Admin user
    const adminUser = {
      id: this.userId++,
      username: "admin",
      password: "123456",
      role: "admin",
      fullName: "Admin User",
      email: "admin@medicare.com",
      phone: "",
      address: "",
      createdAt: new Date()
    };
    this.users.set(adminUser.id, adminUser);

    // Create 3 doctors
    const doctorData = [
      {
        username: "drjohn",
        password: "doctor123",
        fullName: "Dr. John Doe",
        email: "john.doe@medicare.com",
        phone: "+1 234-567-8901",
        department: "Cardiology",
        workingDays: "Mon, Wed, Fri",
        address: "123 Medical Dr, Hospital City"
      },
      {
        username: "drsarah",
        password: "doctor123",
        fullName: "Dr. Sarah Johnson",
        email: "sarah.j@medicare.com",
        phone: "+1 987-654-3210",
        department: "Neurology",
        workingDays: "Tue, Thu, Sat",
        address: "456 Health St, Hospital City"
      },
      {
        username: "drrobert",
        password: "doctor123",
        fullName: "Dr. Robert Patel",
        email: "robert.p@medicare.com",
        phone: "+1 555-123-4567",
        department: "Pediatrics",
        workingDays: "Mon, Tue, Wed, Thu",
        address: "789 Care Ave, Hospital City"
      }
    ];

    doctorData.forEach(doc => {
      const user = {
        id: this.userId++,
        username: doc.username,
        password: doc.password,
        role: "doctor",
        fullName: doc.fullName,
        email: doc.email,
        phone: doc.phone,
        address: doc.address,
        createdAt: new Date()
      };
      this.users.set(user.id, user);

      const doctor = {
        id: this.doctorId++,
        userId: user.id,
        department: doc.department,
        workingDays: doc.workingDays
      };
      this.doctors.set(doctor.id, doctor);
    });

    // Create 3 patients
    const patientData = [
      {
        username: "michael",
        password: "patient123",
        fullName: "Michael Smith",
        email: "michael.s@example.com",
        phone: "+1 111-222-3333",
        address: "123 Patient St, Hospital City",
        medicalHistory: "Hypertension, Diabetes",
        healthConditions: "Allergic to penicillin"
      },
      {
        username: "emily",
        password: "patient123",
        fullName: "Emily Johnson",
        email: "emily.j@example.com",
        phone: "+1 444-555-6666",
        address: "456 Health Ln, Hospital City",
        medicalHistory: "Asthma",
        healthConditions: "No known allergies"
      },
      {
        username: "robert",
        password: "patient123",
        fullName: "Robert Williams",
        email: "robert.w@example.com",
        phone: "+1 777-888-9999",
        address: "789 Wellness Blvd, Hospital City",
        medicalHistory: "Previous surgery in 2020",
        healthConditions: "Allergic to shellfish"
      }
    ];

    patientData.forEach(pat => {
      const user = {
        id: this.userId++,
        username: pat.username,
        password: pat.password,
        role: "patient",
        fullName: pat.fullName,
        email: pat.email,
        phone: pat.phone,
        address: pat.address,
        createdAt: new Date()
      };
      this.users.set(user.id, user);

      const patient = {
        id: this.patientId++,
        userId: user.id,
        medicalHistory: pat.medicalHistory,
        healthConditions: pat.healthConditions
      };
      this.patients.set(patient.id, patient);
    });

    // Add some appointments
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointment1 = {
      id: this.appointmentId++,
      patientId: 1,
      doctorId: 1,
      date: new Date(today.setHours(9, 0, 0, 0)),
      status: "confirmed",
      notes: "Regular checkup"
    };
    this.appointments.set(appointment1.id, appointment1);

    const appointment2 = {
      id: this.appointmentId++,
      patientId: 2,
      doctorId: 2,
      date: new Date(today.setHours(10, 30, 0, 0)),
      status: "scheduled",
      notes: "Follow-up appointment"
    };
    this.appointments.set(appointment2.id, appointment2);

    const appointment3 = {
      id: this.appointmentId++,
      patientId: 3,
      doctorId: 3,
      date: new Date(tomorrow.setHours(14, 0, 0, 0)),
      status: "scheduled",
      notes: "Consultation"
    };
    this.appointments.set(appointment3.id, appointment3);

    // Add some prescriptions
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const prescription1 = {
      id: this.prescriptionId++,
      patientId: 1,
      doctorId: 1,
      date: weekAgo,
      medicine: "Aspirin 81mg",
      dosage: "1 tablet daily",
      instructions: "Take with food",
      status: "active"
    };
    this.prescriptions.set(prescription1.id, prescription1);

    const prescription2 = {
      id: this.prescriptionId++,
      patientId: 1,
      doctorId: 1,
      date: weekAgo,
      medicine: "Atorvastatin 20mg",
      dosage: "1 tablet at bedtime",
      instructions: "Take as directed",
      status: "active"
    };
    this.prescriptions.set(prescription2.id, prescription2);
  }

  // User methods
  async getUserById(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = {
      ...userData,
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Doctor methods
  async getDoctorById(id: number): Promise<DoctorWithUser | undefined> {
    const doctor = this.doctors.get(id);
    if (!doctor) return undefined;

    const user = this.users.get(doctor.userId);
    if (!user) return undefined;

    return { ...doctor, user };
  }

  async getDoctorByUserId(userId: number): Promise<DoctorWithUser | undefined> {
    for (const doctor of this.doctors.values()) {
      if (doctor.userId === userId) {
        const user = this.users.get(doctor.userId);
        if (user) {
          return { ...doctor, user };
        }
      }
    }
    return undefined;
  }

  async getAllDoctors(): Promise<DoctorWithUser[]> {
    const result: DoctorWithUser[] = [];
    for (const doctor of this.doctors.values()) {
      const user = this.users.get(doctor.userId);
      if (user) {
        result.push({ ...doctor, user });
      }
    }
    return result;
  }

  async createDoctor(doctorData: InsertDoctor): Promise<Doctor> {
    const id = this.doctorId++;
    const doctor: Doctor = {
      ...doctorData,
      id
    };
    this.doctors.set(id, doctor);
    return doctor;
  }

  // Patient methods
  async getPatientById(id: number): Promise<PatientWithUser | undefined> {
    const patient = this.patients.get(id);
    if (!patient) return undefined;

    const user = this.users.get(patient.userId);
    if (!user) return undefined;

    return { ...patient, user };
  }

  async getPatientByUserId(userId: number): Promise<PatientWithUser | undefined> {
    for (const patient of this.patients.values()) {
      if (patient.userId === userId) {
        const user = this.users.get(patient.userId);
        if (user) {
          return { ...patient, user };
        }
      }
    }
    return undefined;
  }

  async getAllPatients(): Promise<PatientWithUser[]> {
    const result: PatientWithUser[] = [];
    for (const patient of this.patients.values()) {
      const user = this.users.get(patient.userId);
      if (user) {
        result.push({ ...patient, user });
      }
    }
    return result;
  }

  async createPatient(patientData: InsertPatient): Promise<Patient> {
    const id = this.patientId++;
    const patient: Patient = {
      ...patientData,
      id
    };
    this.patients.set(id, patient);
    return patient;
  }

  async updatePatient(id: number, data: Partial<Patient>): Promise<Patient | undefined> {
    const patient = this.patients.get(id);
    if (!patient) return undefined;

    const updatedPatient = { ...patient, ...data };
    this.patients.set(id, updatedPatient);
    return updatedPatient;
  }

  // Appointment methods
  async getAppointmentById(id: number): Promise<AppointmentWithDetails | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;

    const doctor = await this.getDoctorById(appointment.doctorId);
    const patient = await this.getPatientById(appointment.patientId);

    if (!doctor || !patient) return undefined;

    return { ...appointment, doctor, patient };
  }

  async getAppointmentsByDoctorId(doctorId: number): Promise<AppointmentWithDetails[]> {
    const result: AppointmentWithDetails[] = [];
    for (const appointment of this.appointments.values()) {
      if (appointment.doctorId === doctorId) {
        const doctor = await this.getDoctorById(appointment.doctorId);
        const patient = await this.getPatientById(appointment.patientId);
        
        if (doctor && patient) {
          result.push({ ...appointment, doctor, patient });
        }
      }
    }
    return result;
  }

  async getAppointmentsByPatientId(patientId: number): Promise<AppointmentWithDetails[]> {
    const result: AppointmentWithDetails[] = [];
    for (const appointment of this.appointments.values()) {
      if (appointment.patientId === patientId) {
        const doctor = await this.getDoctorById(appointment.doctorId);
        const patient = await this.getPatientById(appointment.patientId);
        
        if (doctor && patient) {
          result.push({ ...appointment, doctor, patient });
        }
      }
    }
    return result;
  }

  async createAppointment(appointmentData: InsertAppointment): Promise<Appointment> {
    const id = this.appointmentId++;
    const appointment: Appointment = {
      ...appointmentData,
      id
    };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async updateAppointment(id: number, data: Partial<Appointment>): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;

    const updatedAppointment = { ...appointment, ...data };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  // Prescription methods
  async getPrescriptionById(id: number): Promise<PrescriptionWithDetails | undefined> {
    const prescription = this.prescriptions.get(id);
    if (!prescription) return undefined;

    const doctor = await this.getDoctorById(prescription.doctorId);
    const patient = await this.getPatientById(prescription.patientId);

    if (!doctor || !patient) return undefined;

    return { ...prescription, doctor, patient };
  }

  async getPrescriptionsByDoctorId(doctorId: number): Promise<PrescriptionWithDetails[]> {
    const result: PrescriptionWithDetails[] = [];
    for (const prescription of this.prescriptions.values()) {
      if (prescription.doctorId === doctorId) {
        const doctor = await this.getDoctorById(prescription.doctorId);
        const patient = await this.getPatientById(prescription.patientId);
        
        if (doctor && patient) {
          result.push({ ...prescription, doctor, patient });
        }
      }
    }
    return result;
  }

  async getPrescriptionsByPatientId(patientId: number): Promise<PrescriptionWithDetails[]> {
    const result: PrescriptionWithDetails[] = [];
    for (const prescription of this.prescriptions.values()) {
      if (prescription.patientId === patientId) {
        const doctor = await this.getDoctorById(prescription.doctorId);
        const patient = await this.getPatientById(prescription.patientId);
        
        if (doctor && patient) {
          result.push({ ...prescription, doctor, patient });
        }
      }
    }
    return result;
  }

  async createPrescription(prescriptionData: InsertPrescription): Promise<Prescription> {
    const id = this.prescriptionId++;
    const prescription: Prescription = {
      ...prescriptionData,
      id
    };
    this.prescriptions.set(id, prescription);
    return prescription;
  }
}

export const storage = new MemStorage();
