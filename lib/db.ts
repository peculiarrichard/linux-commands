import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super("MONGODB_URI is not set — copy .env.example to .env and fill it in.");
    this.name = "DatabaseNotConfiguredError";
  }
}

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global.mongooseCache ?? { conn: null, promise: null };
global.mongooseCache = cache;

export async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new DatabaseNotConfiguredError();
  }

  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI).catch((err: unknown) => {
      // Don't leave a rejected promise cached — otherwise every request fails
      // forever once the first connection attempt fails, even after the DB
      // comes back up. Also re-thrown as a plain Error: the raw driver error
      // (MongooseServerSelectionError, with Map/class fields in its topology
      // description) isn't serializable across the RSC boundary and crashes
      // Next's own error rendering instead of surfacing the real message.
      cache.promise = null;
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`Could not connect to MongoDB: ${message}`);
    });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
