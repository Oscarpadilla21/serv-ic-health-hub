import { useState, useEffect } from 'react';
import { db, User, Patient, MedicalRecord, Appointment, hashPassword, verifyPassword } from '@/lib/database';
import jsPDF from 'jspdf';

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  password: string;
  email: string;
  fullName: string;
  specialty: string;
  licenseNumber: string;
  securityQuestion: string;
  securityAnswer: string;
}

interface RecoveryData {
  username: string;
  securityAnswer: string;
  newPassword: string;
}

export const useDatabase = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    try {
      await db.open();
      // Verificar si hay usuario logueado en sessionStorage
      const savedUserId = sessionStorage.getItem('currentUserId');
      if (savedUserId) {
        const user = await db.users.get(parseInt(savedUserId));
        setCurrentUser(user || null);
      }
    } catch (error) {
      console.error('Error initializing database:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Autenticación
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      const user = await db.users.where('username').equals(credentials.username).first();
      if (user && await verifyPassword(credentials.password, user.passwordHash)) {
        setCurrentUser(user);
        sessionStorage.setItem('currentUserId', user.id!.toString());
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      // Verificar si usuario o email ya existen
      const existingUser = await db.users
        .where('username').equals(userData.username)
        .or('email').equals(userData.email)
        .first();
      
      if (existingUser) return false;

      const passwordHash = await hashPassword(userData.password);
      const securityAnswerHash = await hashPassword(userData.securityAnswer.toLowerCase());

      const userId = await db.users.add({
        username: userData.username,
        fullName: userData.fullName,
        email: userData.email,
        specialty: userData.specialty,
        licenseNumber: userData.licenseNumber,
        passwordHash,
        securityQuestion: userData.securityQuestion,
        securityAnswer: securityAnswerHash,
        createdAt: new Date()
      });

      const newUser = await db.users.get(userId);
      if (newUser) {
        setCurrentUser(newUser);
        sessionStorage.setItem('currentUserId', userId.toString());
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const recoverPassword = async (recoveryData: RecoveryData): Promise<boolean> => {
    try {
      const user = await db.users.where('username').equals(recoveryData.username).first();
      if (!user) return false;

      const answerHash = await hashPassword(recoveryData.securityAnswer.toLowerCase());
      if (answerHash !== user.securityAnswer) return false;

      const newPasswordHash = await hashPassword(recoveryData.newPassword);
      await db.users.update(user.id!, { passwordHash: newPasswordHash });
      return true;
    } catch (error) {
      console.error('Password recovery error:', error);
      return false;
    }
  };

  const getSecurityQuestion = async (username: string): Promise<string | null> => {
    try {
      const user = await db.users.where('username').equals(username).first();
      return user?.securityQuestion || null;
    } catch (error) {
      console.error('Error getting security question:', error);
      return null;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('currentUserId');
  };

  // Gestión de pacientes
  const addPatient = async (patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<number | null> => {
    if (!currentUser?.id) return null;
    try {
      const id = await db.patients.add({
        ...patientData,
        userId: currentUser.id,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return id;
    } catch (error) {
      console.error('Error adding patient:', error);
      return null;
    }
  };

  const getPatients = async (): Promise<Patient[]> => {
    if (!currentUser?.id) return [];
    try {
      return await db.patients.where('userId').equals(currentUser.id).toArray();
    } catch (error) {
      console.error('Error getting patients:', error);
      return [];
    }
  };

  const searchPatients = async (query: string): Promise<Patient[]> => {
    if (!currentUser?.id) return [];
    try {
      return await db.patients
        .where('userId').equals(currentUser.id)
        .and(patient => 
          patient.firstName.toLowerCase().includes(query.toLowerCase()) ||
          patient.lastName.toLowerCase().includes(query.toLowerCase()) ||
          patient.documentNumber.includes(query)
        )
        .toArray();
    } catch (error) {
      console.error('Error searching patients:', error);
      return [];
    }
  };

  // Gestión de historias clínicas
  const addMedicalRecord = async (recordData: Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<number | null> => {
    if (!currentUser?.id) return null;
    try {
      const id = await db.medicalRecords.add({
        ...recordData,
        userId: currentUser.id,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return id;
    } catch (error) {
      console.error('Error adding medical record:', error);
      return null;
    }
  };

  const getMedicalRecords = async (patientId: number): Promise<MedicalRecord[]> => {
    try {
      const records = await db.medicalRecords
        .where('patientId').equals(patientId)
        .toArray();
      return records.sort((a, b) => b.date.getTime() - a.date.getTime());
    } catch (error) {
      console.error('Error getting medical records:', error);
      return [];
    }
  };

  // Exportar datos
  const exportData = async (): Promise<string> => {
    if (!currentUser?.id) throw new Error('Usuario no autenticado');
    
    try {
      const patients = await db.patients.where('userId').equals(currentUser.id).toArray();
      const medicalRecords = await db.medicalRecords.where('userId').equals(currentUser.id).toArray();
      const appointments = await db.appointments.where('userId').equals(currentUser.id).toArray();

      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        user: {
          username: currentUser.username,
          fullName: currentUser.fullName,
          email: currentUser.email,
          specialty: currentUser.specialty,
          licenseNumber: currentUser.licenseNumber
        },
        patients,
        medicalRecords,
        appointments
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  };

  // Importar datos
  const importData = async (jsonData: string): Promise<boolean> => {
    if (!currentUser?.id) return false;

    try {
      const data = JSON.parse(jsonData);
      
      // Validar estructura básica
      if (!data.patients || !data.medicalRecords) {
        throw new Error('Formato de datos inválido');
      }

      // Importar pacientes
      for (const patient of data.patients) {
        delete patient.id; // Remover ID para evitar conflictos
        patient.userId = currentUser.id;
        patient.createdAt = new Date(patient.createdAt);
        patient.updatedAt = new Date();
        await db.patients.add(patient);
      }

      // Importar historias clínicas
      for (const record of data.medicalRecords) {
        delete record.id;
        record.userId = currentUser.id;
        record.date = new Date(record.date);
        record.createdAt = new Date(record.createdAt);
        record.updatedAt = new Date();
        await db.medicalRecords.add(record);
      }

      // Importar citas si existen
      if (data.appointments) {
        for (const appointment of data.appointments) {
          delete appointment.id;
          appointment.userId = currentUser.id;
          appointment.date = new Date(appointment.date);
          appointment.createdAt = new Date(appointment.createdAt);
          await db.appointments.add(appointment);
        }
      }

      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  };

  // Generar PDF de historia clínica
  const generateMedicalRecordPDF = async (patientId: number): Promise<void> => {
    try {
      const patient = await db.patients.get(patientId);
      const records = await getMedicalRecords(patientId);
      
      if (!patient) throw new Error('Paciente no encontrado');

      const doc = new jsPDF();
      
      // Configurar fuente y título
      doc.setFontSize(20);
      doc.text('Historia Clínica', 20, 30);
      
      // Información del paciente
      doc.setFontSize(14);
      doc.text(`Paciente: ${patient.firstName} ${patient.lastName}`, 20, 50);
      doc.text(`Documento: ${patient.documentNumber}`, 20, 60);
      doc.text(`Fecha de Nacimiento: ${patient.birthDate.toLocaleDateString()}`, 20, 70);
      doc.text(`Teléfono: ${patient.phone}`, 20, 80);
      doc.text(`Email: ${patient.email}`, 20, 90);
      
      if (patient.bloodType) {
        doc.text(`Tipo de Sangre: ${patient.bloodType}`, 20, 100);
      }
      
      if (patient.allergies) {
        doc.text(`Alergias: ${patient.allergies}`, 20, 110);
      }

      // Información del médico
      doc.text(`Médico: ${currentUser?.fullName}`, 20, 130);
      doc.text(`Especialidad: ${currentUser?.specialty}`, 20, 140);
      doc.text(`Licencia: ${currentUser?.licenseNumber}`, 20, 150);

      // Registros médicos
      let yPosition = 170;
      doc.setFontSize(16);
      doc.text('Registros Médicos:', 20, yPosition);
      yPosition += 20;

      doc.setFontSize(12);
      records.forEach((record, index) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 30;
        }

        doc.text(`${index + 1}. Fecha: ${record.date.toLocaleDateString()}`, 20, yPosition);
        yPosition += 10;
        doc.text(`   Motivo: ${record.chiefComplaint}`, 20, yPosition);
        yPosition += 10;
        doc.text(`   Diagnóstico: ${record.diagnosis}`, 20, yPosition);
        yPosition += 10;
        doc.text(`   Tratamiento: ${record.treatment}`, 20, yPosition);
        yPosition += 20;
      });

      // Generar y descargar PDF
      const fileName = `historia_clinica_${patient.firstName}_${patient.lastName}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  };

  return {
    // Estado
    currentUser,
    isLoading,
    isAuthenticated: !!currentUser,
    
    // Autenticación
    login,
    register,
    logout,
    recoverPassword,
    getSecurityQuestion,
    
    // Pacientes
    addPatient,
    getPatients,
    searchPatients,
    
    // Historias clínicas
    addMedicalRecord,
    getMedicalRecords,
    
    // Exportar/Importar
    exportData,
    importData,
    generateMedicalRecordPDF
  };
};