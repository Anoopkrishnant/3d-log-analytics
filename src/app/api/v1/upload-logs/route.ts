import { NextRequest, NextResponse } from "next/server";
import { uploadSessions } from "@/utils/sessionStore";
import { addLogProcessingJob } from "../../../../utils/queue";

function validateEntries(entries: any[]): { valid: number; malformed: number } {
  const valid = entries.filter((e) => e && typeof e === "object").length;
  const malformed = entries.length - valid;
  return { valid, malformed };
}

function generateSessionId() {
  return Math.random().toString(36).slice(2, 10);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { entries, sessionId, totalChunks } = body;

    if (!Array.isArray(entries)) {
      return NextResponse.json({ error: "Missing or invalid 'entries'" }, { status: 400 });
    }

    let currentSessionId = sessionId;
    let isNewSession = false;

    if (!currentSessionId) {
      currentSessionId = generateSessionId();
      isNewSession = true;
      uploadSessions[currentSessionId] = {
        entries: [],
        stats: { 
          totalRows: 0, 
          validRows: 0, 
          malformedCount: 0, 
          chunksCreated: 0, 
          processingTimeMs: 0 
        },
        totalChunks,
        receivedChunks: 0,
        processingStarted: false,
      };
    }

    const session = uploadSessions[currentSessionId];
    if (!session) {
      return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
    }

    const { valid, malformed } = validateEntries(entries);
    
    // Update session stats
    session.entries.push(...entries);
    session.stats.totalRows += entries.length;
    session.stats.validRows += valid;
    session.stats.malformedCount += malformed;
    session.stats.chunksCreated++;
    session.receivedChunks = (session.receivedChunks || 0) + 1;

    // Add job to queue with correct table name
    const job = await addLogProcessingJob("process-chunk", {
      sessionId: currentSessionId,
      table: "log_stats", // Changed from "logs" to "log_stats"
      data: entries,
      chunkInfo: { 
        chunkIndex: session.receivedChunks, 
        totalChunks: session.totalChunks || 1 
      },
      metadata: {
        originalRowCount: entries.length,
        chunkRowCount: entries.length,
        tableName: "log_stats",
        timestamp: Date.now(),
      },
    });

    console.log(`[API] Enqueued chunk job for session ${currentSessionId}, jobId: ${job.id}`);

    return NextResponse.json({
      status: "ok",
      sessionId: currentSessionId,
      processing: session.stats,
      receivedChunks: session.receivedChunks,
      totalChunks: session.totalChunks,
      isNewSession,
      jobId: job.id, // Include job ID for debugging
    });
  } catch (e: any) {
    console.error("Upload API error:", e);
    return NextResponse.json({ 
      error: e.message || "Unknown error" 
    }, { status: 500 });
  }
}