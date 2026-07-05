import { NextResponse } from "next/server";
import { getEventMetrics } from "@/lib/aggregations/getEventMetrics";

export const dynamic = "force-dynamic";

/**
 * GET /api/events/[id]/counts
 *
 * Per-event counts for every event-scoped collection. Single source of truth
 * shared with `lib/aggregations/getEventMetrics`; used by the operations
 * dashboard's "Active Event Overview" card so the dropdown switch can refresh
 * the displayed numbers without a full server navigation.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const metrics = await getEventMetrics(id);
    return NextResponse.json({ success: true, data: metrics });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch event metrics";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}