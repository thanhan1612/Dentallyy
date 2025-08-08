import { database } from "@/appwrite-config/appwrite.config";
import axiosInstance from "./axios";

export const authService = {
  fetchBranchDocuments: async(): Promise<any> => {
    const response = await database.listDocuments(process.env.NEXT_PUBLIC_DATABASE_ID!, process.env.NEXT_PUBLIC_BRANCH_COLLECTION!)
    return response.documents
  }
};
