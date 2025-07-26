// app/api/session-progress/[sessionId]/route.ts - Session Progress Tracking
import { NextRequest, NextResponse } from "next/server";
import { redisConnection } from "@/utils/redis";
import { uploadSessions } from "@/utils/sessionStore";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = 'https://jnivhgsheolfjbvgqnxj.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuaXZoZ3NoZW9sZmpidmdxbnhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MjM0ODcsImV4cCI6MjA2ODQ5OTQ4N30.lmeK1Hv0PJX2H1fZscHBMIQmr3i_vvSK8yqueLjPJM8";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId;
    
    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 });
    }
    
    // Get session data from memory
    const session = uploadSessions[sessionId];
    
    // Get chunk progress from Redis
    const progressKey = `upload_progress:${sessionId}:chunks`;
    const chunkProgress = await redisConnection.hgetall(progressKey);
    
    // Parse chunk progress
    const chunks = Object.entries(chunkProgress).map(([chunkIndex, dataStr]) => {
      try {
        return {
          chunkIndex: parseInt(chunkIndex),
          ...JSON.parse(dataStr)
        };
      } catch {
        return {
          chunkIndex: parseInt(chunkIndex),
          status: 'unknown',
          error: 'Failed to parse progress data'
        };
      }
    }).sort((a, b) => a.chunkIndex - b.chunkIndex);
    
    // Calculate overall progress
    const totalChunks = session?.totalChunks || chunks.length;
    const completedChunks = chunks.filter(c => c.status === 'completed').length;
    const failedChunks = chunks.filter(c => c.status === 'failed').length;
    const processingChunks = chunks.filter(c => c.status === 'processing').length;
    
    const totalRecordsProcessed = chunks.reduce((sum, chunk) => sum + (chunk.recordsProcessed || 0), 0);
    const totalRecordsInserted = chunks.reduce((sum, chunk) => sum + (chunk.recordsInserted || 0), 0);
    
    // Get database records count for verification
    const { count: dbRecordCount } = await supabase
      .from('log_stats')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', sessionId);
    
    const response = {
      sessionId,
      status: session ? 'active' : 'not_found',
      progress: {
        totalChunks,
        completedChunks,
        failedChunks,
        processingChunks,
        pendingChunks: Math.max(0, totalChunks - completedChunks - failedChunks - processingChunks),
        percentComplete: totalChunks > 0 ? Math.round((completedChunks / totalChunks) * 100) : 0
      },
      records: {
        processed: totalRecordsProcessed,
        inserted: totalRecordsInserted,
        dbCount: dbRecordCount || 0,
        insertionRate: totalRecordsProcessed > 0 ? Math.round((totalRecordsInserted / totalRecordsProcessed) * 100) : 0
      },
      session: session ? {
        totalRows: session.stats.totalRows,
        validRows: session.stats.validRows,
        malformedCount: session.stats.malformedCount,
        chunksCreated: session.stats.chunksCreated,
        receivedChunks: session.receivedChunks,
        processingStarted: session.processingStarted
      } : null,
      chunks: chunks.slice(0, 20), // Return first 20 chunks to avoid large responses
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(response);
    
  } catch (error: any) {
    console.error('[SESSION-PROGRESS] Error:', error);
    return NextResponse.json({
      error: error.message || "Failed to get session progress",
      sessionId: params.sessionId
    }, { status: 500 });
  }
}