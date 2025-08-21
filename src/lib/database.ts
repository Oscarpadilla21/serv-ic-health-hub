import Dexie, { Table } from 'dexie';

export interface User {
  id?: number;
  username: string;
  fullName: string;
  email: string;
  specialty: string;
  licenseNumber: string;
  passwordHash: string;
  securityQuestion: string;
  securityAnswer: string;
  createdAt: Date;
}

export interface Patient {
  id?: number;
  documentNumber: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  gender: 'M' | 'F' | 'Other';
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  bloodType?: string;
  allergies?: string;
  medicalHistory?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: number; // Asociado al médico
}

export interface MedicalRecord {
  id?: number;
  patientId: number;
  userId: number; // Médico que creó el registro
  date: Date;
  chiefComplaint: string; // Motivo de consulta
  presentIllness: string; // Enfermedad actual
  physicalExam: string; // Examen físico
  diagnosis: string; // Diagnóstico
  treatment: string; // Tratamiento
  notes?: string; // Observaciones adicionales
  prescriptions?: string; // Medicamentos recetados
  followUp?: string; // Seguimiento
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id?: number;
  patientId: number;
  userId: number;
  date: Date;
  time: string;
  reason: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  createdAt: Date;
}

export class MedicalDatabase extends Dexie {
  users!: Table<User>;
  patients!: Table<Patient>;
  medicalRecords!: Table<MedicalRecord>;
  appointments!: Table<Appointment>;

  constructor() {
    super('SerVirHCDatabase');
    
    this.version(1).stores({
      users: '++id, username, email',
      patients: '++id, documentNumber, userId, firstName, lastName',
      medicalRecords: '++id, patientId, userId, date',
      appointments: '++id, patientId, userId, date'
    });
  }
}

export const db = new MedicalDatabase();

// Funciones de utilidad para hash de contraseñas (básico)
export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
};