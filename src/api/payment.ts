import { ID, Query } from "appwrite";
import { database } from "@/appwrite-config/appwrite.config";

export const paymentService = {
  // getPaymentById: async (id: string) => {
  //   const response = await database.getDocument(
  //     process.env.NEXT_PUBLIC_DATABASE_ID!,
  //     process.env.NEXT_PUBLIC_PAYMENT_COLLECTION!,
  //     id
  //   );
  //   return response;
  // },

  createPaymentDocument: async (payment: any) => {
    const response = await database.createDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_PAYMENT_COLLECTION!,
      ID.unique(),
      payment
    );
    return response;
  },

  updatePaymentDocument: async (id: string, payment: any) => {
    const response = await database.updateDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_PAYMENT_COLLECTION!,
      id,
      payment
    );
    return response.document;
  },

  getHighestPaymentCode: async () => {
    try {
      const response = await database.listDocuments(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        process.env.NEXT_PUBLIC_PAYMENT_COLLECTION!,
        [
          Query.orderDesc("$createdAt"),
          Query.limit(1),
          Query.select(["invoice_num"])
        ]
      );

      if (response.documents.length > 0) {
        const paymentCode = response.documents[0].invoice_num;
        // Extract number from payment code (e.g., "PAY001" -> 1)
        const number = paymentCode ? parseInt(paymentCode.replace(/[^0-9]/g, '')) : 0;
        return number;
      }
      return 0;
    } catch (error) {
      console.error("Error getting highest payment code:", error);
      return 0;
    }
  },

  getPaymentDocuments: async (
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
            Query.contains("payment_code", search),
            Query.contains("patient_name", search),
            Query.contains("treatment_name", search),
            Query.contains("amount", search),
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
          process.env.NEXT_PUBLIC_PAYMENT_COLLECTION!,
          queries
        ),
        paymentService.getHighestPaymentCode()
      ]);

      return {
        data: documentsResponse.documents,
        total: highestCode
      };
    } catch (error) {
      console.error("Error fetching payment documents:", error);
      return {
        data: [],
        total: 0
      };
    }
  },
  getTotalPaymentDocuments: async (
  query?: any,
  limit?: number,
  offset?: number,
  search?: string,
  status?: string
) => {
  try {
    // Build base queries for filtering (without limit/offset for counting)
    let baseQueries = [Query.orderDesc("$createdAt")];

    if (search) {
      baseQueries.push(
        Query.or([
          Query.contains("payment_code", search),
          Query.contains("patient_name", search),
          Query.contains("treatment_name", search),
          Query.contains("amount", search),
        ])
      );
    }
    if (status && status !== "all") {
      baseQueries.push(Query.equal("status", status));
    }
    if (query && query.fieldId && query.value !== undefined) {
      baseQueries.push(Query.equal(query.fieldId, query.value));
    }

    // Get paginated results
    const paginatedQueries = [
      ...baseQueries,
      Query.limit(limit || 20),
      Query.offset(offset || 0)
    ];

    // Get total count by paginating through all results
    const getTotalCount = async () => {
      let total = 0;
      let currentOffset = 0;
      const batchSize = 100;

      while (true) {
        const countQueries = [
          ...baseQueries,
          Query.limit(batchSize),
          Query.offset(currentOffset)
        ];

        const batch = await database.listDocuments(
          process.env.NEXT_PUBLIC_DATABASE_ID!,
          process.env.NEXT_PUBLIC_PAYMENT_COLLECTION!,
          countQueries
        );

        total += batch.documents.length;

        // If we got fewer documents than the batch size, we've reached the end
        if (batch.documents.length < batchSize) {
          break;
        }

        currentOffset += batchSize;
      }

      return total;
    };

    const [documentsResponse, totalCount] = await Promise.all([
      database.listDocuments(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        process.env.NEXT_PUBLIC_PAYMENT_COLLECTION!,
        paginatedQueries
      ),
      getTotalCount()
    ]);

    return {
      data: documentsResponse.documents,
      total: totalCount
    };
  } catch (error) {
    console.error("Error fetching payment documents:", error);
    return {
      data: [],
      total: 0
    };
  }
},

  
  
};
