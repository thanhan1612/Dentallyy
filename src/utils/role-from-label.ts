import { UserRole } from "@/contexts/AuthContext";

export const getRoleFromLabels = (labels: string[] | undefined) => {
    if (!labels || !Array.isArray(labels)) return "staff";
    
    const labelToRole: { [key: string]: UserRole } = {
      'SADMIN': 'super_admin',
      'BADMIN': 'branch_admin',
      'DOCTOR': 'doctor',
      'STAFF': 'staff'
    };

    // Get the first label and map it to corresponding role
    const label = labels[0]?.toUpperCase();
    return labelToRole[label] || 'staff';
  };