import { model, models, Schema, type InferSchemaType } from "mongoose";

const taskSchema = new Schema(
  {
    incidentId: {
      type: Schema.Types.ObjectId,
      ref: "Incident",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      required: true,
      trim: true,
      default: "open",
    },
    assignedTo: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

export type TaskDocument = InferSchemaType<typeof taskSchema>;

export const Task = models.Task || model("Task", taskSchema);
