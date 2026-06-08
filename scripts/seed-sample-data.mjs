import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";

function loadMongoUri() {
  if (process.env.MONGODB_URI) {
    return process.env.MONGODB_URI;
  }

  const envPath = path.join(process.cwd(), ".env.local");

  if (!fs.existsSync(envPath)) {
    throw new Error("Missing MONGODB_URI. Set it in the environment or .env.local.");
  }

  const envFile = fs.readFileSync(envPath, "utf8");
  const line = envFile
    .split(/\r?\n/)
    .find((entry) => entry.startsWith("MONGODB_URI="));

  if (!line) {
    throw new Error("MONGODB_URI not found in .env.local.");
  }

  return line.slice("MONGODB_URI=".length).trim();
}

const mongoUri = loadMongoUri();

const eventSchema = new mongoose.Schema(
  {
    name: String,
    venue: String,
    startDate: Date,
    endDate: Date,
    description: String,
  },
  { timestamps: true },
);

const speakerSchema = new mongoose.Schema(
  {
    eventId: mongoose.Schema.Types.ObjectId,
    name: String,
    company: String,
    email: String,
    phone: String,
    arrivalStatus: String,
  },
  { timestamps: true },
);

const volunteerSchema = new mongoose.Schema(
  {
    eventId: mongoose.Schema.Types.ObjectId,
    name: String,
    role: String,
    phone: String,
    currentStatus: String,
  },
  { timestamps: true },
);

const incidentSchema = new mongoose.Schema(
  {
    eventId: mongoose.Schema.Types.ObjectId,
    type: String,
    severity: String,
    description: String,
    status: String,
    reportedAt: Date,
  },
  { timestamps: true },
);

const taskSchema = new mongoose.Schema(
  {
    incidentId: mongoose.Schema.Types.ObjectId,
    title: String,
    description: String,
    status: String,
    assignedTo: String,
  },
  { timestamps: true },
);

const Event = mongoose.models.Event || mongoose.model("Event", eventSchema);
const Speaker =
  mongoose.models.Speaker || mongoose.model("Speaker", speakerSchema);
const Volunteer =
  mongoose.models.Volunteer || mongoose.model("Volunteer", volunteerSchema);
const Incident =
  mongoose.models.Incident || mongoose.model("Incident", incidentSchema);
const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);

async function seed() {
  await mongoose.connect(mongoUri, { bufferCommands: false });

  const event = await Event.create({
    name: "Helm Event Operations Summit 2026",
    venue: "Bangalore International Exhibition Centre",
    startDate: new Date("2026-07-18T08:00:00+05:30"),
    endDate: new Date("2026-07-18T19:00:00+05:30"),
    description:
      "One-day event operations summit covering speaker logistics, volunteer coordination, and live incident response.",
  });

  const speakers = await Speaker.insertMany([
    {
      eventId: event._id,
      name: "Ananya Rao",
      company: "AzureVista Events",
      email: "ananya.rao@azurevista.in",
      phone: "+91 98765 11001",
      arrivalStatus: "checked-in",
    },
    {
      eventId: event._id,
      name: "Rahul Menon",
      company: "OpsForge Labs",
      email: "rahul.menon@opsforge.ai",
      phone: "+91 98765 11002",
      arrivalStatus: "en-route",
    },
    {
      eventId: event._id,
      name: "Meera Iyer",
      company: "SignalPeak Media",
      email: "meera.iyer@signalpeak.co",
      phone: "+91 98765 11003",
      arrivalStatus: "pending",
    },
  ]);

  const volunteers = await Volunteer.insertMany([
    {
      eventId: event._id,
      name: "Arjun Nair",
      role: "Registration Desk",
      phone: "+91 98800 22001",
      currentStatus: "on-site",
    },
    {
      eventId: event._id,
      name: "Priya Das",
      role: "Speaker Green Room",
      phone: "+91 98800 22002",
      currentStatus: "on-site",
    },
    {
      eventId: event._id,
      name: "Kiran Babu",
      role: "AV Support Runner",
      phone: "+91 98800 22003",
      currentStatus: "dispatched",
    },
    {
      eventId: event._id,
      name: "Shreya Kulkarni",
      role: "Room Turnover",
      phone: "+91 98800 22004",
      currentStatus: "break",
    },
    {
      eventId: event._id,
      name: "Vikram Shah",
      role: "VIP Escort",
      phone: "+91 98800 22005",
      currentStatus: "on-call",
    },
  ]);

  const incidents = await Incident.insertMany([
    {
      eventId: event._id,
      type: "AV",
      severity: "high",
      description:
        "Main stage confidence monitor stopped receiving feed during speaker rehearsal.",
      status: "investigating",
      reportedAt: new Date("2026-07-18T08:45:00+05:30"),
    },
    {
      eventId: event._id,
      type: "Transport",
      severity: "medium",
      description:
        "Speaker shuttle for Rahul Menon is delayed by traffic near Yeshwantpur.",
      status: "mitigated",
      reportedAt: new Date("2026-07-18T09:05:00+05:30"),
    },
    {
      eventId: event._id,
      type: "Crowd Flow",
      severity: "medium",
      description:
        "Registration queue exceeded stanchion area near the east entrance.",
      status: "open",
      reportedAt: new Date("2026-07-18T09:20:00+05:30"),
    },
  ]);

  const tasks = await Task.insertMany([
    {
      incidentId: incidents[0]._id,
      title: "Reconnect stage monitor feed",
      description:
        "Inspect HDMI splitter and restore confidence monitor signal before keynote.",
      status: "in-progress",
      assignedTo: "Kiran Babu",
    },
    {
      incidentId: incidents[0]._id,
      title: "Prepare backup display",
      description:
        "Move spare monitor from breakout room storage to main stage holding area.",
      status: "open",
      assignedTo: "Priya Das",
    },
    {
      incidentId: incidents[1]._id,
      title: "Update session lead on ETA",
      description:
        "Inform programming desk and hold speaker intro by five minutes if needed.",
      status: "completed",
      assignedTo: "Vikram Shah",
    },
    {
      incidentId: incidents[2]._id,
      title: "Open overflow check-in point",
      description:
        "Redirect walk-in attendees to the secondary registration table near Hall B.",
      status: "in-progress",
      assignedTo: "Arjun Nair",
    },
    {
      incidentId: incidents[2]._id,
      title: "Deploy crowd guidance volunteer",
      description:
        "Station one volunteer at the east entrance to guide attendees into two lines.",
      status: "open",
      assignedTo: "Shreya Kulkarni",
    },
  ]);

  console.log(
    JSON.stringify(
      {
        eventId: event._id,
        created: {
          events: 1,
          speakers: speakers.length,
          volunteers: volunteers.length,
          incidents: incidents.length,
          tasks: tasks.length,
        },
      },
      null,
      2,
    ),
  );
}

seed()
  .catch((error) => {
    console.error("Sample seed failed.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
