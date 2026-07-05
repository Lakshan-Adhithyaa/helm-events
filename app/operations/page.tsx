import { connectToDatabase } from "@/lib/db";
import { Event, type EventDocument } from "@/models/event";
import { Activity } from "@/models/activity";
import { getEventMetrics, type EventMetrics } from "@/lib/aggregations/getEventMetrics";
import { CollectionView } from "@/components/operations/collection-view";
import { ActivityTimeline } from "@/components/operations/activity-timeline";
import { DemoGenerator } from "@/components/operations/demo-generator";
import { NewEventButton } from "@/components/operations/new-event-button";
import {
  ActiveEventOverview,
  type EventSummary,
} from "@/components/operations/active-event-overview";
import Link from "next/link";
import {
  Users,
  Calendar,
  MapPin,
  MicrophoneStage,
  Handshake,
  ChartLineUp,
  Pulse,
  ShieldCheck,
  ArrowLeft,
  CaretRight,
  Clock,
  Buildings,
  IdentificationCard,
  ListBullets,
  CalendarCheck,
  Gauge,
  ListChecks,
  Heartbeat,
} from "@phosphor-icons/react/dist/ssr";

export const dynamic = "force-dynamic";

export default async function OperationsPage({
  searchParams,
}: {
  searchParams: Promise<{ collection?: string; view?: string; search?: string; eventId?: string; incidentId?: string }>;
}) {
  const { collection, view, search, eventId, incidentId } = await searchParams;
  await connectToDatabase();

  // Initialize variables.
  // Per-event counts (speakers/sessions/etc.) are scoped to the *active*
  // event, not global totals across every event in the DB. Activity has no
  // eventId and is therefore inherently global.
  let eventCount = 0;
  let activityCount = 0;
  let metrics: EventMetrics = {
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
  let activeEventId: string | null = null;
  let events: EventSummary[] = [];

  // Conditional data fetching
  if (!collection) {
    // Dashboard overview requires per-event counts, every event (for the
    // switcher), and the active event selection (URL `eventId` if present,
    // otherwise the most recently created event).
    const [totalEvents, activityTotal, eventDocs] = await Promise.all([
      Event.countDocuments(),
      Activity.countDocuments(),
      Event.find().sort({ createdAt: -1 }).lean(),
    ]);

    eventCount = totalEvents;
    activityCount = activityTotal;

    const typedEventDocs = eventDocs as unknown as Array<
      EventDocument & { _id: { toString(): string } }
    >;
    events = typedEventDocs.map((doc) => ({
      _id: doc._id.toString(),
      name: doc.name,
      venue: doc.venue,
      city: doc.city,
      timezone: doc.timezone,
      startDate: doc.startDate ? new Date(doc.startDate).toISOString() : undefined,
      endDate: doc.endDate ? new Date(doc.endDate).toISOString() : undefined,
      status: doc.status,
    }));

    // Resolve the active event from the URL when present, else fall back to
    // the newest. The chosen id drives the per-event metric lookup below.
    activeEventId = eventId ?? typedEventDocs[0]?._id?.toString() ?? null;
    metrics = await getEventMetrics(activeEventId);
  } else {
    // Collection view: the active event must come from the URL if provided.
    // Falling back to the newest event only when `eventId` is absent so the
    // switcher selection (carried in the URL) is preserved when drilling in.
    const fallback = await Event.findOne()
      .sort({ createdAt: -1 })
      .select("_id")
      .lean() as (EventDocument & { _id: { toString(): string } }) | null;
    activeEventId = eventId ?? fallback?._id?.toString() ?? null;
  }

  // Carry the active event through the collection view (and quick-action
  // links) so the scoped query matches what the user selected on the
  // dashboard. We omit eventId for the "events" collection itself (it isn't
  // event-scoped) and for absolute `href:` links that point elsewhere.
  const collectionHref = (id: string) => {
    const params = [`collection=${id}`];
    if (activeEventId && id !== "events") {
      params.push(`eventId=${activeEventId}`);
    }
    return `?${params.join("&")}`;
  };

  if (collection) {
    const titles: Record<string, string> = {
      speakers: "Speakers",
      attendees: "Attendees",
      volunteers: "Volunteers",
      sponsors: "Sponsors",
      events: "Events",
      sessions: "Sessions",
      rooms: "Rooms",
      organizers: "Organizers",
      facilities: "Facilities",
      shifts: "Shifts",
      tasks: "Tasks",
      incidents: "Incidents",
      logs: "API Logs",
      health: "System Health",
      analytics: "Analytics",
      activities: "Activity Log",
    };

    const title = titles[collection];

    return (
      <div className="min-h-[calc(100dvh-4rem)] bg-slate-50 px-4 py-6 sm:px-6 sm:py-10 text-slate-900">
        <div className="mx-auto w-full max-w-6xl">
          <Link
            href={activeEventId ? `/operations?eventId=${activeEventId}` : "/operations"}
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600"
          >
            <ArrowLeft size={16} weight="bold" />
            Back to Data Hub
          </Link>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm">
            {collection === "activities" && view !== "table" ? (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
                    <p className="text-slate-500">Chronological stream of system and human actions</p>
                  </div>
                  <Link 
                    href="/operations?collection=activities&view=table"
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    View as Table
                  </Link>
                </div>
                <ActivityTimeline />
              </div>
            ) : title ? (
              <CollectionView
                title={title}
                collectionName={collection}
                latestEventId={activeEventId ?? undefined}
                incidentId={incidentId}
                initialSearchTerm={search}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 rounded-full bg-slate-100 p-4">
                  <Pulse size={32} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">
                  Coming Soon
                </h3>
                <p className="mt-2 max-w-xs text-slate-500">
                  The {collection} management interface is currently under
                  development.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const categories = [
    {
      title: "People",
      description: "Manage event participants and stakeholders",
      items: [
        {
          id: "speakers",
          name: "Speakers",
          icon: MicrophoneStage,
          count: metrics.speakers,
          color: "text-indigo-600",
          bg: "bg-indigo-50",
        },
        {
          id: "attendees",
          name: "Attendees",
          icon: Users,
          count: metrics.attendees,
          color: "text-blue-600",
          bg: "bg-blue-50",
        },
        {
          id: "volunteers",
          name: "Volunteers",
          icon: Users,
          count: metrics.volunteers,
          color: "text-emerald-600",
          bg: "bg-emerald-50",
        },
        {
          id: "sponsors",
          name: "Sponsors",
          icon: Handshake,
          count: metrics.sponsors,
          color: "text-amber-600",
          bg: "bg-amber-50",
        },
        {
          id: "organizers",
          name: "Organizers",
          icon: IdentificationCard,
          count: metrics.organizers,
          color: "text-rose-600",
          bg: "bg-rose-50",
        },
      ],
    },
    {
      title: "Operations",
      description: "Core logistics and infrastructure",
      items: [
        {
          id: "events",
          name: "Events",
          icon: Calendar,
          count: eventCount,
          color: "text-sky-600",
          bg: "bg-sky-50",
        },
        {
          id: "sessions",
          name: "Sessions",
          icon: Clock,
          count: metrics.sessions,
          color: "text-violet-600",
          bg: "bg-violet-50",
        },
        {
          id: "rooms",
          name: "Rooms",
          icon: MapPin,
          count: metrics.rooms,
          color: "text-rose-600",
          bg: "bg-rose-50",
        },
        {
          id: "facilities",
          name: "Facilities",
          icon: Buildings,
          count: metrics.facilities,
          color: "text-emerald-600",
          bg: "bg-emerald-50",
        },
        {
          id: "incidents",
          name: "Incidents",
          icon: Pulse,
          count: metrics.incidents,
          color: "text-rose-600",
          bg: "bg-rose-50",
        },
        {
          id: "tasks",
          name: "Tasks",
          icon: ListBullets,
          count: metrics.tasks,
          color: "text-amber-600",
          bg: "bg-amber-50",
        },
        {
          id: "shifts",
          name: "Shifts",
          icon: CalendarCheck,
          count: metrics.shifts,
          color: "text-indigo-600",
          bg: "bg-indigo-50",
        },
        {
          id: "task-operations",
          name: "Task Operations",
          icon: ListChecks,
          count: "Live",
          color: "text-rose-600",
          bg: "bg-rose-50",
          href: "/operations/task-operations",
        },
        ],
        },
    {
      title: "Runtime",
      description: "System health and real-time analytics",
      items: [
        {
          id: "event-health",
          name: "Event Health",
          icon: Heartbeat,
          count: "Live",
          color: "text-rose-600",
          bg: "bg-rose-50",
          href: "/operations/health",
        },
        {
          id: "metrics",
          name: "Performance",
          icon: Gauge,
          count: "Live",
          color: "text-indigo-600",
          bg: "bg-indigo-50",
          href: "/operations/metrics",
        },
        {
          id: "activities",
          name: "Activity Log",
          icon: ListBullets,
          count: activityCount,
          color: "text-indigo-600",
          bg: "bg-indigo-50",
        },
        {
          id: "logs",
          name: "API Logs",
          icon: Pulse,
          count: "Live",
          color: "text-slate-600",
          bg: "bg-slate-50",
        },
        {
          id: "health",
          name: "System Health",
          icon: ShieldCheck,
          count: "100%",
          color: "text-blue-600",
          bg: "bg-blue-50",
        },
        {
          id: "analytics",
          name: "Resolution Analytics",
          icon: ChartLineUp,
          count: "Live",
          color: "text-orange-600",
          bg: "bg-orange-50",
          href: "/operations/analytics",
        },
      ],
    },
  ];

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.05),_transparent_25%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.05),_transparent_25%),#f8fafc] px-4 py-6 sm:px-6 sm:py-10 text-slate-900">
      <div className="mx-auto w-full max-w-6xl space-y-12">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              Event Data Hub
            </h1>
            <p className="text-lg text-slate-500">
              Centralized operational control for your event ecosystem.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <NewEventButton />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200 ring-inset">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Connected to MongoDB
            </span>
          </div>
        </header>

        {/* Event Overview Section */}
        <ActiveEventOverview
          events={events}
          activeEventId={activeEventId}
          speakerCount={metrics.speakers}
          sessionCount={metrics.sessions}
          volunteerCount={metrics.volunteers}
        />

        {/* Quick Actions */}
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
            Quick Actions
          </h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <DemoGenerator />
            <NewEventButton />
            <Link
              href={collectionHref("speakers")}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium text-slate-700 transition-all hover:border-indigo-200 hover:bg-indigo-50/30"
            >
              Add Keynote Speaker
              <CaretRight size={14} />
            </Link>
            <Link
              href={collectionHref("sessions")}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium text-slate-700 transition-all hover:border-indigo-200 hover:bg-indigo-50/30"
            >
              Schedule Session
              <CaretRight size={14} />
            </Link>
          </div>
        </section>

        {/* Collection Grid */}
        <div className="space-y-12">
          {categories.map((category) => (
            <section key={category.title} className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  {category.title}
                </h2>
                <p className="text-slate-500">{category.description}</p>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {category.items.map((item) => (
                  <Link
                    key={item.id}
                    href={(item as { href?: string }).href ?? collectionHref(item.id)}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.bg} ${item.color}`}
                      >
                        <item.icon size={28} weight="duotone" />
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                        {item.count}
                      </span>
                    </div>
                    <div className="mt-8">
                      <h3 className="text-lg font-bold text-slate-900">
                        {item.name}
                      </h3>
                      <div className="mt-1 flex items-center gap-1 text-sm font-medium text-slate-400 transition-colors group-hover:text-indigo-600">
                        Manage collection
                        <CaretRight
                          size={14}
                          weight="bold"
                          className="transition-transform group-hover:translate-x-0.5"
                        />
                      </div>
                    </div>
                    <div className="absolute right-0 bottom-0 h-24 w-24 translate-x-8 translate-y-8 opacity-[0.03] transition-opacity group-hover:opacity-[0.08]">
                      <item.icon size={96} weight="fill" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
