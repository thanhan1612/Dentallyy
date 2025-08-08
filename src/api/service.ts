import { database } from "@/appwrite-config/appwrite.config";
import { ID, Query } from "appwrite";

export const serviceService = {
  getServiceDocuments: async (query?: any , limit?: number, offset?: number, search?: string): Promise<any> => {
    const filters = [Query.limit(limit || 20), Query.offset(offset || 0)];
    if (query && query.fieldId && query.value !== undefined) {
      filters.push(Query.equal(query.fieldId, query.value));
    }
    if (search) {
      filters.push(Query.contains("name", search));
    }
    const response = await database.listDocuments(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_SERVICE_COLLECTION!,
      filters
    );
    return {
      data: response.documents,
      total: response.total
    };
  },

  createServiceDocuments: async (data: any): Promise<any> => {
    const response = await database.createDocument(process.env.NEXT_PUBLIC_DATABASE_ID!, process.env.NEXT_PUBLIC_SERVICE_COLLECTION!, ID.unique(), data);
    return response;
  },

  updateServiceDocuments: async (id: string, data: any): Promise<any> => {
    const response = await database.updateDocument(process.env.NEXT_PUBLIC_DATABASE_ID!, process.env.NEXT_PUBLIC_SERVICE_COLLECTION!, id, data);
    return response;
  },
  
  deleteServiceDocuments: async (id: string): Promise<any> => {
    const response = await database.deleteDocument(process.env.NEXT_PUBLIC_DATABASE_ID!, process.env.NEXT_PUBLIC_SERVICE_COLLECTION!, id);
    return response;
  },

};
