export interface Patient {
  id: string
  patient_code: string
  name: string
  dob: Date
  gender: string
  phone: string
  address: string
  lastVisit?: string
  nextAppointment?: string
  status: 'active' | 'completed' | 'new'
  email?: string
  isDeleted?: boolean
} 