import { database } from "@/appwrite-config/appwrite.config";
import { ID, Query } from "appwrite";

export const patientsService = {
  getPatientById: async (id: string) => {
    const response = await database.getDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_PATIENTS_COLLECTION!,
      id
    );
    return response;
  },

  createPatientDocument: async (patient: any) => {
    const response = await database.createDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_PATIENTS_COLLECTION!,
      ID.unique(),
      patient
    );
    return response;
  },

  updatePatientDocument: async (id: string, patient: any) => {
    const response = await database.updateDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_PATIENTS_COLLECTION!,
      id,
      patient
    );
    return response.document;
  },

  getHighestPatientCode: async () => {
    try {
      const response = await database.listDocuments(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        process.env.NEXT_PUBLIC_PATIENTS_COLLECTION!,
        [
          Query.orderDesc("$updatedAt"),
          Query.limit(1),
          Query.select(["patient_code"])
        ]
      );

      if (response.documents.length > 0) {
        const patientCode = response.documents[0].patient_code;
        // Extract number from patient code (e.g., "P001" -> 1)
        const number = patientCode ? parseInt(patientCode.replace(/[^0-9]/g, '')) : 0;
        return number;
      }
      return 0;
    } catch (error) {
      console.error("Error getting highest patient code:", error);
      return 0;
    }
  },

  getPatientDocuments: async (
    query?: any,
    limit?: number,
    offset?: number,
    search?: string,
    status?: string,
  ) => {
    try {
      let queries = [
        Query.limit(limit || 20), 
        Query.offset(offset || 0), 
        Query.orderDesc("$updatedAt"), 
        Query.equal("isDeleted", false)
      ];

      // Add search query only if search term exists
      if (search?.trim()) {
        queries.push(
          Query.or([
            Query.contains("patient_code", search),
            Query.contains("name", search),
            Query.contains("phone", search),
            Query.contains("email", search),
          ])
        );
      }

      // Add status query only if status is specified and not "all"
      if (status && status !== "all") {
        queries.push(Query.equal("treatment_status", status));
      }

      // Add branch query only if specified
      if (query?.fieldId && query?.value !== undefined) {
        queries.push(Query.equal(query.fieldId, query.value));
      }

      // Execute queries in parallel
      const [documentsResponse, highestCode] = await Promise.all([
        database.listDocuments(
          process.env.NEXT_PUBLIC_DATABASE_ID!,
          process.env.NEXT_PUBLIC_PATIENTS_COLLECTION!,
          queries
        ),
        // Only fetch highest code if needed (e.g., for new patient creation)
        offset === 0 ? patientsService.getHighestPatientCode() : Promise.resolve(0)
      ]);

      return {
        data: documentsResponse.documents,
        total: highestCode
      };
    } catch (error) {
      console.error("Error fetching patient documents:", error);
      return {
        data: [],
        total: 0
      };
    }
  },
  getTotalPatientDocuments: async (
  query?: any,
  limit?: number,
  offset?: number,
  search?: string,
  status?: string,
) => {
  try {
    
    let baseQueries = [
      Query.orderDesc("$updatedAt"), 
      Query.equal("isDeleted", false)
    ];

    if (search) {
      baseQueries.push(
        Query.or([
          Query.contains("patient_code", search),
          Query.contains("name", search),
          Query.contains("phone", search),
          Query.contains("email", search),
        ])
      );
    }
    if (status && status !== "all") {
      baseQueries.push(Query.equal("treatment_status", status));
    }
    if (query && query.fieldId && query.value !== undefined) {
      baseQueries.push(Query.equal(query.fieldId, query.value));
    }

    // Get paginated results
    const paginatedQueries = [
      ...baseQueries,
      Query.limit(limit || 9999),
      Query.offset(offset || 0)
    ];
    

    const [documentsResponse, totalCount] = await Promise.all([
      database.listDocuments(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        process.env.NEXT_PUBLIC_PATIENTS_COLLECTION!,
        paginatedQueries
      ),
      patientsService.getHighestPatientCode()
    ]);

    return {
      data: documentsResponse.documents,
      total: totalCount
    };
  } catch (error) {
    console.error("Error fetching patient documents:", error);
    return {
      data: [],
      total: 0
    };
  }
},
};
