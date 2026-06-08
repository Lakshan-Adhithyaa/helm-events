import { model, models, Schema, type InferSchemaType } from "mongoose";

const incidentSchema = new Schema(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    severity: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      trim: true,
      default: "open",
    },
    reportedAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export type IncidentDocument = InferSchemaType<typeof incidentSchema>;

export const Incident = models.Incident || model("Incident", incidentSchema);
