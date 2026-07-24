import mongoose, { Schema, Document } from "mongoose";

export interface IGuildSetting extends Document {
  guildId: string;
  key: string;
  value: any;
}

const GuildSettingSchema = new Schema<IGuildSetting>(
  {
    guildId: { type: String, required: true, index: true },
    key: { type: String, required: true },
    value: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true },
);

GuildSettingSchema.index({ guildId: 1, key: 1 }, { unique: true });

export const GuildSetting =
  mongoose.models.GuildSetting ||
  mongoose.model<IGuildSetting>("GuildSetting", GuildSettingSchema);
