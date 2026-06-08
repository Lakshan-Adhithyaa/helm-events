import { model, models, Schema, type InferSchemaType } from "mongoose";

const speakerSchema = new Schema(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    arrivalStatus: {
      type: String,
      required: true,
      trim: true,
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

export type SpeakerDocument = InferSchemaType<typeof speakerSchema>;

export const Speaker = models.Speaker || model("Speaker", speakerSchema);
