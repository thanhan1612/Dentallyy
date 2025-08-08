import { database } from "@/appwrite-config/appwrite.config";
import { Query } from "appwrite";

export const prescriptionService = {
  createPatientPrescription: async (data: any , id: string): Promise<any> => {
    const response = await database.createDocument(process.env.NEXT_PUBLIC_DATABASE_ID!, process.env.NEXT_PUBLIC_PRESCRIPTION!, id, data);
    return response;
  },  
  deletePatientPrescription: async (id: string): Promise<any> => {
    const response = await database.deleteDocument(process.env.NEXT_PUBLIC_DATABASE_ID!, process.env.NEXT_PUBLIC_PRESCRIPTION!, id);
    return response;
  },
  getPatientPrescription: async (query?: any): Promise<any> => {
    const url = query ? await database.listDocuments(process.env.NEXT_PUBLIC_DATABASE_ID!, process.env.NEXT_PUBLIC_PRESCRIPTION!, [
      Query.equal(query?.fieldId, query?.value)
    ]) : await database.listDocuments(process.env.NEXT_PUBLIC_DATABASE_ID!, process.env.NEXT_PUBLIC_PRESCRIPTION!);
    return url.documents;
  }
};
