import { account, database } from "@/appwrite-config/appwrite.config";
import { ID, Query } from "appwrite";
export const doctorService = {
  getDoctorDocuments: async (query?: any, limit?: number, offset?: number, search?: string): Promise<any> => {
    const filters = [Query.equal('role', 'doctor'), Query.limit(limit || 20), Query.offset(offset || 0)];
    if (query && query.fieldId && query.value !== undefined) {
      filters.push(Query.equal(query.fieldId, query.value));
    }
    if (search) {
      filters.push(Query.contains("name", search));
    }
    const url = await database.listDocuments(process.env.NEXT_PUBLIC_DATABASE_ID!, process.env.NEXT_PUBLIC_STAFF_COLLECTION!, filters);
    return {
      data: url.documents,
      total: url.total,
    };
  },
  
  createDoctorDocuments: async (data: any): Promise<any> => {
    const url = await database.createDocument(process.env.NEXT_PUBLIC_DATABASE_ID!, process.env.NEXT_PUBLIC_STAFF_COLLECTION!, ID.unique(), data);
    return url;
  },

  updateDoctorDocuments: async (id: string, data: any): Promise<any> => {
    const url = await database.updateDocument(process.env.NEXT_PUBLIC_DATABASE_ID!, process.env.NEXT_PUBLIC_STAFF_COLLECTION!, id, data);
    return url;
  },

  deleteDoctorDocuments: async (id: string): Promise<any> => {
    const url = await database.deleteDocument(process.env.NEXT_PUBLIC_DATABASE_ID!, process.env.NEXT_PUBLIC_STAFF_COLLECTION!, id);
    return url;
  },

  createAccountDoctor: async (email: string, password: string, name?: string): Promise<any> => {
    const url = await account.create(ID.unique(), email, password, name);
    return url;
  }
};
