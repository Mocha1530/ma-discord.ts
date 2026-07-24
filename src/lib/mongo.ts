import mongoose from "mongoose";
import { GuildSetting } from "./models/GuildSetting";

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
    };
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI!, opts)
      .then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export const storage = {
  getGuildSetting: async (guildId: string, key: string) => {
    await connectToDatabase();
    const doc = await GuildSetting.findOne({ guildId, key });
    return doc?.value ?? null;
  },

  setGuildSetting: async (guildId: string, key: string, value: any) => {
    await connectToDatabase();
    await GuildSetting.findOneAndUpdate(
      { guildId, key },
      { value },
      { upsert: true, new: true },
    );
  },
};
