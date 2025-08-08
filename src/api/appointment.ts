import { database } from "@/appwrite-config/appwrite.config";
import { ID, Query } from "appwrite";

export const appointmentService = {
  fetchAppointmentDocuments: async (query?: any, limit?: number, offset?: number) => {
    const filters = [Query.limit(limit || 20), Query.offset(offset || 0)];
    if (query && query.fieldId && query.value !== undefined) {
      filters.push(Query.equal(query.fieldId, query.value));
    }
    const response = await database.listDocuments(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPOINTMENT_COLLECTION!,
      filters
    );
    return {
      data: response.documents,
      total: response.total,
    };
  },

  updateAppointmentDocuments: async (id: string, data: any) => {
    const response = await database.updateDocument(process.env.NEXT_PUBLIC_DATABASE_ID!, process.env.NEXT_PUBLIC_APPOINTMENT_COLLECTION!, id, data);
    return response.document;
  },

  createAppointmentDocuments: async (data: any) => {
    const response = await database.createDocument(process.env.NEXT_PUBLIC_DATABASE_ID!, process.env.NEXT_PUBLIC_APPOINTMENT_COLLECTION!, ID.unique(), data);
    return response.document;
  }
};
