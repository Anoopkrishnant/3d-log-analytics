// pages/api/queue-status.ts or app/api/queue-status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { logProcessingQueue } from "@/utils/queue";

export async function GET(req: NextRequest) {
  try {
    const waiting = await logProcessingQueue.getWaiting();
    const active = await logProcessingQueue.getActive();
    const completed = await logProcessingQueue.getCompleted();
    const failed = await logProcessingQueue.getFailed();

    return NextResponse.json({
      status: "ok",
      queue: {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
      },
      jobs: {
        waiting: waiting.map(j => ({ id: j.id, name: j.name, data: j.data })),
        active: active.map(j => ({ id: j.id, name: j.name, data: j.data })),
        failed: failed.map(j => ({ id: j.id, name: j.name, failedReason: j.failedReason }))
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message || "Failed to get queue status"
    }, { status: 500 });
  }
}