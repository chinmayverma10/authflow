
import mongoose from "mongoose";

let connectionPromise: Promise<typeof mongoose> | null = null;

export async function connect(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (!connectionPromise) {
    const mongoUrl = process.env.MONGO_URL;

    if (!mongoUrl) {
      throw new Error("MONGO_URL is not configured");
    }

    connectionPromise = mongoose.connect(mongoUrl).catch((error) => {
      connectionPromise = null;
      throw error;
    });
  }

  return connectionPromise;
}
