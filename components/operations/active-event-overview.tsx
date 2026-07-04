"use client";

import { useState } from "react";
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
  initialActiveEventId: string | null;
  speakerCount: number;
  sessionCount: number;
  volunteerCount: number;
}

/**
 * The "Active Event Overview" card on the operations dashboard. The active
 * event is chosen from a dropdown of every event in the system; selecting one
 * updates the displayed context instantly, with no page refresh.
 */
export function ActiveEventOverview({
  events,
  initialActiveEventId,
  speakerCount,
  sessionCount,
  volunteerCount,
}: ActiveEventOverviewProps) {
  const [activeEventId, setActiveEventId] = useState<string | null>(
    initialActiveEventId
  );

  const activeEvent = events.find((e) => e._id === activeEventId) ?? null;

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
                onValueChange={(value) => setActiveEventId(value)}
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
                  <p className="text-xl font-bold text-slate-900">
                    {speakerCount}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Sessions
                  </p>
                  <p className="text-xl font-bold text-slate-900">
                    {sessionCount}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Volunteers
                  </p>
                  <p className="text-xl font-bold text-slate-900">
                    {volunteerCount}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Status
                  </p>
                  <div className="mt-1">
                    <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">
                      80% Ready
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
