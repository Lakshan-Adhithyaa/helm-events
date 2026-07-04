"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { RecordDialog } from "./record-dialog";
import { getFields } from "./field-definitions";

/**
 * "New Event" action for the operations dashboard. Reuses the same record
 * creation flow as the Events collection view (RecordDialog + POST /api/events)
 * — this is *not* the sample/demo event generator.
 */
export function NewEventButton() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const fields = getFields("events");

  const handleSave = async (formData: unknown) => {
    const response = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      const err = new Error(result.error || "Failed to create event") as Error & {
        fieldErrors?: Record<string, string>;
      };
      err.fieldErrors = result.fieldErrors;
      throw err;
    }
    // Refresh server data so the new event shows up across the dashboard.
    router.refresh();
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="h-auto rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
      >
        <Plus size={16} weight="bold" />
        New Event
      </Button>
      <RecordDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSave={handleSave}
        title="Add Event"
        fields={fields}
        initialData={null}
      />
    </>
  );
}
