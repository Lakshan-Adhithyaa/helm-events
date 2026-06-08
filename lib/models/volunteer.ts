import { model, models, Schema, type InferSchemaType } from "mongoose";

const volunteerSchema = new Schema(
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
    role: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    currentStatus: {
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

export type VolunteerDocument = InferSchemaType<typeof volunteerSchema>;

export const Volunteer =
  models.Volunteer || model("Volunteer", volunteerSchema);
