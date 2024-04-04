/**
 * Source: MongoDB - Next.js example app
 * @see https://github.com/mongodb-developer/nextjs-with-mongodb/blob/main/lib/mongodb.ts
 */

import { MongoClient } from 'mongodb';

if (!process.env.DB_USER || !process.env.DB_PASS || !process.env.DB_CLUSTER) {
  throw new Error('Invalid/missing db environment variables');
}

const DB_URI = `mongodb+srv://${process.env.DB_USER}:${encodeURIComponent(
  process.env.DB_PASS || ''
)}@${process.env.DB_CLUSTER}/`;

const options = {};

let client;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(DB_URI, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(DB_URI, options);
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;
