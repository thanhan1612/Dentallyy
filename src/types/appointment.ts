export interface TimeSlot {
  id: string;
  time: string;
  isBooked?: boolean;
}

export interface AppointmentFormData {
  patientType: 'existing' | 'new';
  patientId?: string;
  patientName?: string;
  patientPhone?: string;
  patientEmail?: string;
  date: Date;
  time: string;
  serviceId: string;
  doctorId: string;
  branchId: string;
  notes?: string;
}

export const TIME_SLOTS: TimeSlot[] = [
  { id: "1", time: "08:00" },
  { id: "2", time: "09:00" },
  { id: "3", time: "10:00" },
  { id: "4", time: "11:00" },
  { id: "5", time: "13:00" },
  { id: "6", time: "14:00" },
  { id: "7", time: "15:00" },
  { id: "8", time: "16:00" },
]; 