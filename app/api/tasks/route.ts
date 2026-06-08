import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/db";
import { Task } from "@/lib/models/task";

export async function GET() {
  try {
    await connectToDatabase();
    const tasks = await Task.find().sort({ createdAt: -1 });

    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to fetch tasks.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const payload = await request.json();
    const task = await Task.create(payload);

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create task.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
