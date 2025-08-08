import { database } from "@/appwrite-config/appwrite.config";
import { ID, Query } from "appwrite";

export const inventoryService = {
  fetchInventoryDocuments: async (query?: any, limit?: number, offset?: number, search?: string, status?: string) => {
    const filters = [Query.limit(limit || 20), Query.offset(offset || 0)];
    if (query && query.fieldId && query.value !== undefined) {
      filters.push(Query.equal(query.fieldId, query.value));
    }
    if (search) {
      filters.push(Query.contains("name", search));
    }
    if (status && status !== "all") {
      filters.push(Query.equal("category", status));
    }
    
    const response = await database.listDocuments(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_INVENTORY_COLLECTION!,
      filters
    );
    return {
      data: response.documents,
      total: response.total,
    };
  },

  createInventoryDocuments: async (data: any) => {
    const response = await database.createDocument(process.env.NEXT_PUBLIC_DATABASE_ID!, process.env.NEXT_PUBLIC_INVENTORY_COLLECTION!, ID.unique(), data);
    return response;
  },

  updateInventoryDocuments: async (id: string, data: any) => {
    const response = await database.updateDocument(process.env.NEXT_PUBLIC_DATABASE_ID!, process.env.NEXT_PUBLIC_INVENTORY_COLLECTION!, id, data);
    return response;
  },

  deleteInventoryDocuments: async (id: string) => {
    const response = await database.deleteDocument(process.env.NEXT_PUBLIC_DATABASE_ID!, process.env.NEXT_PUBLIC_INVENTORY_COLLECTION!, id);
    return response;
  },
};
