import { MongoClient, type Collection, type Db, type ObjectId } from "mongodb";
import type { ItemId, PayMethod } from "./menu";

export interface SaleDoc {
  _id?: ObjectId;
  itemId: ItemId;
  name: string;
  price: number;
  pay: PayMethod;
  createdAt: Date;
  clientId: string;
}

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  var _mongoIndexesPromise: Promise<void> | undefined;
}

function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set. Add it to .env.local (see .env.example).");
  }
  // Cache on globalThis so dev hot-reloads and warm serverless invocations reuse one connection.
  if (!globalThis._mongoClientPromise) {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 8000,
      maxPoolSize: 10,
    });
    globalThis._mongoClientPromise = client.connect().catch((err) => {
      globalThis._mongoClientPromise = undefined;
      throw err;
    });
  }
  return globalThis._mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(process.env.MONGODB_DB || "stall");
}

export async function salesCollection(): Promise<Collection<SaleDoc>> {
  const db = await getDb();
  const col = db.collection<SaleDoc>("sales");
  if (!globalThis._mongoIndexesPromise) {
    globalThis._mongoIndexesPromise = Promise.all([
      col.createIndex({ clientId: 1 }, { unique: true, name: "clientId_unique" }),
      col.createIndex({ createdAt: -1 }, { name: "createdAt" }),
    ])
      .then(() => undefined)
      .catch((err) => {
        globalThis._mongoIndexesPromise = undefined;
        throw err;
      });
  }
  await globalThis._mongoIndexesPromise;
  return col;
}
