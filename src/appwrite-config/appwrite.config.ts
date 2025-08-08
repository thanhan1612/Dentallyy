import { Client, Account, Databases, ID } from 'appwrite';

export const client = new Client();

client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

export const account = new Account(client);
export const database = new Databases(client); // Fixed: renamed to 'databases' and removed 'any' type

const DATABASE_ID = '68301f36002f8df5d2fa';
const COLLECTION_ID = '68302a2d00324739ea36';

// Function to delete all documents in a collection
export const deleteAllDocuments = async () => {
    try {
        // List all documents
        const response = await database.listDocuments(DATABASE_ID, COLLECTION_ID);
        const document = response.documents;

        // Delete each document
        for (const doc of document) {
            await database.deleteDocument(DATABASE_ID, COLLECTION_ID, doc.$id);
            console.log(`Deleted document with ID: ${doc.$id}`);
        }

        console.log('All documents deleted successfully');
    } catch (error) {
        console.error('Error deleting documents:', error);
    }
};
