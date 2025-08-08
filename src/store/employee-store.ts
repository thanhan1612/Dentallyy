import { create } from 'zustand';

interface AccountInfo {
  email: string;
  password: string;
}

interface PersonalInfo {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  dateOfBirth: Date;
  gender: string;
  avatar?: File;
  specialty: string;
  description?: string;
}

interface EmployeeStore {
  // Account Info from Step 1
  accountInfo: AccountInfo | null;
  setAccountInfo: (info: AccountInfo) => void;
  
  // Personal Info from Step 2
  personalInfo: PersonalInfo | null;
  setPersonalInfo: (info: PersonalInfo) => void;
  
  // Reset store
  resetStore: () => void;
  
  // Pending Employee data
  pendingEmployee: any;
  setPendingEmployee: (info: any) => void;
  clearPendingEmployee: () => void;
}

export const useEmployeeStore = create<EmployeeStore>((set) => ({
  accountInfo: null,
  setAccountInfo: (info) => set({ accountInfo: info }),
  
  personalInfo: null,
  setPersonalInfo: (info) => set({ personalInfo: info }),
  
  resetStore: () => set({ 
    accountInfo: null, 
    personalInfo: null,
    pendingEmployee: null
  }),
  
  pendingEmployee: null,
  setPendingEmployee: (info) => set({ pendingEmployee: info }),
  clearPendingEmployee: () => set({ pendingEmployee: null }),
})); 