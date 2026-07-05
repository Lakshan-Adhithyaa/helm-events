import { connectToDatabase } from "@/lib/db";
import { Event } from "@/models/event";
import { Session } from "@/models/session";
import { Speaker } from "@/models/speaker";
import { Room } from "@/models/room";
import { Attendee } from "@/models/attendee";
import { Sponsor } from "@/models/sponsor";
import { Volunteer } from "@/models/volunteer";
import { Facility } from "@/models/facility";
import { Organizer } from "@/models/organizer";
import { Task } from "@/models/task";
import { Shift } from "@/models/shift";
import { Incident } from "@/models/incident";

/**
 * Per-event metric counts. Every field here is scoped to a single event via
 * its `eventId` (which all these collections carry). Activity has no eventId
 * intentionally excluded from this shape.
 */
export interface EventMetrics {
  speakers: number;
  sessions: number;
  rooms: number;
  attendees: number;
  sponsors: number;
  volunteers: number;
  facilities: number;
  organizers: number;
  tasks: number;
  shifts: number;
  incidents: number;
}

const ZERO_METRICS: EventMetrics = {
  speakers: 0,
  sessions: 0,
  rooms: 0,
  attendees: 0,
  sponsors: 0,
  volunteers: 0,
  facilities: 0,
  organizers: 0,
  tasks: 0,
  shifts: 0,
  incidents: 0,
};

/**
 * Compute per-event counts for all event-scoped collections in a single
 * `Promise.all`. This is the single source of truth used by both the
 * operations dashboard (`app/operations/page.tsx`) and the per-event counts
 * API (`/api/events/[id]/counts`), mirroring the logic that previously lived
 * only in the `debug/event-graph` route.
 *
 * Returns `ZERO_METRICS` (all zero) when `eventId` is null/invalid so callers
 * can render empty states uniformly without null checks.
 */
export async function getEventMetrics(
  eventId: string | null | undefined
): Promise<EventMetrics> {
  if (!eventId) return ZERO_METRICS;

  await connectToDatabase();

  // Verify the event exists; cheap guard so a stale `eventId` in the URL
  // doesn't silently surface zero counts as if they were real data.
  const exists = await Event.exists({ _id: eventId });
  if (!exists) return ZERO_METRICS;

  const filter = { eventId };

  const [
    speakers,
    sessions,
    rooms,
    attendees,
    sponsors,
    volunteers,
    facilities,
    organizers,
    tasks,
    shifts,
    incidents,
  ] = await Promise.all([
    Speaker.countDocuments(filter),
    Session.countDocuments(filter),
    Room.countDocuments(filter),
    Attendee.countDocuments(filter),
    Sponsor.countDocuments(filter),
    Volunteer.countDocuments(filter),
    Facility.countDocuments(filter),
    Organizer.countDocuments(filter),
    Task.countDocuments(filter),
    Shift.countDocuments(filter),
    Incident.countDocuments(filter),
  ]);

  return {
    speakers,
    sessions,
    rooms,
    attendees,
    sponsors,
    volunteers,
    facilities,
    organizers,
    tasks,
    shifts,
    incidents,
  };
}