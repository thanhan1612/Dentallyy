import { database } from "@/appwrite-config/appwrite.config";
import { ID, Query } from "appwrite";

export const treatmentService = {
  getTreatmentsByPatientId: async (id: string) => {
    const response = await database.getDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_TREATMENT_COLLECTION!,
      id
    );
    return response;
  },

  createTreatmentDocument: async (treatment: any) => {
    const response = await database.createDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_TREATMENT_COLLECTION!,
      ID.unique(),
      treatment
    );
    return response;
  },

  updateTreatmentDocument: async (id: string, treatment: any) => {
    const response = await database.updateDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_TREATMENT_COLLECTION!,
      id,
      treatment
    );
    return response.document;
  },

  getHighestTreatmentCode: async () => {
    try {
      const response = await database.listDocuments(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        process.env.NEXT_PUBLIC_TREATMENT_COLLECTION!,
        [
          Query.orderDesc("$createdAt"),
          Query.limit(1),
          Query.select(["treatment_code"])
        ]
      );

      if (response.documents.length > 0) {
        const treatmentCode = response.documents[0].treatment_code;
        // Extract number from treatment code (e.g., "T001" -> 1)
        const number = parseInt(treatmentCode.replace(/[^0-9]/g, ''));
        return number;
      }
      return 0;
    } catch (error) {
      console.error("Error getting highest treatment code:", error);
      return 0;
    }
  },

  getTreatmentDocuments: async (
    query?: any,
    limit?: number,
    offset?: number,
    search?: string,
    status?: string
  ) => {
    try {
      let queries = [Query.limit(limit || 20), Query.offset(offset || 0), Query.orderDesc("$createdAt")];
      if (search) {
        queries.push(
          Query.or([
            Query.contains("treatment_code", search),
            Query.contains("patient_name", search),
            Query.contains("treatment_name", search),
          ])
        );
      }
      if (status && status !== "all") {
        queries.push(Query.equal("status", status));
      }
      if (query && query.fieldId && query.value !== undefined) {
        queries.push(Query.equal(query.fieldId, query.value));
      }

      const [documentsResponse, highestCode] = await Promise.all([
        database.listDocuments(
          process.env.NEXT_PUBLIC_DATABASE_ID!,
          process.env.NEXT_PUBLIC_TREATMENT_COLLECTION!,
          queries
        ),
        treatmentService.getHighestTreatmentCode()
      ]);

      return {
        data: documentsResponse.documents,
        total: highestCode
      };
    } catch (error) {
      console.error("Error fetching treatment documents:", error);
      return {
        data: [],
        total: 0
      };
    }
  },
};
