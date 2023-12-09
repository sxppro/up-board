import { Db, MongoClient } from 'mongodb';

const DB_URI = `mongodb+srv://${process.env.DB_USER}:${encodeURIComponent(
  process.env.DB_PASS || ''
)}@${process.env.DB_CLUSTER}/`;

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export const connectToDatabase = async (databaseName: string) => {
  if (cachedClient && cachedDb) {
    return {
      client: cachedClient,
      db: cachedDb,
    };
  }

  const opts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  let client = new MongoClient(DB_URI, {
    retryWrites: true,
    writeConcern: {
      w: 'majority',
    },
    maxPoolSize: 2,
  });
  await client.connect();
  let db = client.db(databaseName);

  cachedClient = client;
  cachedDb = db;

  return {
    client: cachedClient,
    db: cachedDb,
  };
};
