import { NextResponse } from "next/server";
import { checkAndEnqueueReminders, processNotificationQueue } from "@/lib/notifications";

export async function GET(req: Request) {
  try {
    // Cron authorization check (Bearer token or Vercel native cron trigger verification)
    const authHeader = req.headers.get("authorization");
    if (process.env.CRON_SECRET) {
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && req.headers.get("x-vercel-cron") !== "true") {
        return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
      }
    }

    // 1. Scan appointments and queue reminders
    const remindersResult = await checkAndEnqueueReminders();
    if ('error' in remindersResult) {
      throw new Error(remindersResult.error);
    }

    // 2. Process all pending notifications in the queue
    const queueResult = await processNotificationQueue();
    if ('error' in queueResult) {
      throw new Error(queueResult.error);
    }

    return NextResponse.json({
      success: true,
      enqueuedReminders: remindersResult.enqueued || 0,
      processedQueueItems: queueResult.processed || 0,
    });
  } catch (err: any) {
    console.error("Cron worker exception:", err);
    return NextResponse.json({ error: err.message || err }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return GET(req);
}
