"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  CaretDown,
} from "@phosphor-icons/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface EventSummary {
  _id: string;
  name: string;
  venue: string;
  city: string;
  timezone?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

interface ActiveEventOverviewProps {
  events: EventSummary[];
  /** Active event id resolved from the URL `eventId` (or newest-fallback). */
  activeEventId: string | null;
  /** Server-side counts for the active event, scoped via getEventMetrics. */
  speakerCount: number;
  sessionCount: number;
  volunteerCount: number;
}

/**
 * The "Active Event Overview" card on the operations dashboard.
 *
 * Switching the dropdown pushes `?eventId=...` into the URL, which forces the
 * server component (`app/operations/page.tsx`) to recompute per-event counts
 * (via `getEventMetrics`) and re-render this card with fresh props. So
 * switching actually changes the displayed people — it isn't cosmetic.
 */
export function ActiveEventOverview({
  events,
  activeEventId,
  speakerCount,
  sessionCount,
  volunteerCount,
}: ActiveEventOverviewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const activeEvent = events.find((e) => e._id === activeEventId) ?? null;

  /**
   * Switching events pushes `eventId` into the query string. This triggers a
   * server re-render of the whole page, which scopes every metric to the new
   * event and flows the new values back through props.
   */
  const handleEventChange = (value: string) => {
    const params = new URLSearchParams();
    params.set("eventId", value);
    startTransition(() => {
      router.push(`/operations?${params.toString()}`);
    });
  };

  // While a navigation is pending, dim the numbers so the switch feels
  // responsive even before the server round-trip completes.
  const countsOpacity = isPending ? "opacity-50" : "opacity-100";

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto]">
        <div className="p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
                <Calendar size={24} weight="bold" />
              </div>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-600">
                  Active Event Overview
                </h2>
              </div>
            </div>

            {events.length > 0 && (
              <Select
                value={activeEventId ?? undefined}
                onValueChange={handleEventChange}
              >
                <SelectTrigger className="h-9 w-full max-w-[16rem] gap-2 rounded-xl border-slate-200 bg-white text-sm font-medium text-slate-700">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Event:
                  </span>
                  <SelectValue placeholder="Select event" />
                  <CaretDown size={14} className="text-slate-400" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event._id} value={event._id}>
                      {event.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {activeEvent ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {activeEvent.name}
                </h3>
                <div className="mt-2 flex flex-wrap gap-4 text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={18} />
                    <span>
                      {activeEvent.venue}, {activeEvent.city}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={18} />
                    <span>
                      {activeEvent.startDate &&
                      !Number.isNaN(new Date(activeEvent.startDate).getTime())
                        ? new Date(activeEvent.startDate).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" }
                          )
                        : "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle size={18} className="text-emerald-500" />
                    <span className="capitalize">{activeEvent.status}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Speakers
                  </p>
                  <p
                    className={`text-xl font-bold text-slate-900 transition-opacity ${countsOpacity}`}
                  >
                    {speakerCount}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Sessions
                  </p>
                  <p
                    className={`text-xl font-bold text-slate-900 transition-opacity ${countsOpacity}`}
                  >
                    {sessionCount}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Volunteers
                  </p>
                  <p
                    className={`text-xl font-bold text-slate-900 transition-opacity ${countsOpacity}`}
                  >
                    {volunteerCount}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Status
                  </p>
                  <div className="mt-1">
                    <span className="inline-flex rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-bold capitalize text-indigo-700">
                      {activeEvent.status ?? "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4">
              <p className="text-slate-500">
                No events found. Start by creating your first event.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}