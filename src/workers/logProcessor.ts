// worker/logWorker.ts - Updated for your log data structure
import { Worker, Job } from "bullmq";
import { createClient } from "@supabase/supabase-js";
import { redisConnection } from "@/utils/redis";
import { uploadSessions } from "@/utils/sessionStore";

const SUPABASE_URL = 'https://jnivhgsheolfjbvgqnxj.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuaXZoZ3NoZW9sZmpidmdxbnhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MjM0ODcsImV4cCI6MjA2ODQ5OTQ4N30.lmeK1Hv0PJX2H1fZscHBMIQmr3i_vvSK8yqueLjPJM8";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const BATCH_SIZE = 100;

// Initialize worker
export const logWorker = new Worker(
  "log-processing",
  async (job: Job) => {
    console.log(`[WORKER] Starting job ${job.id}, type: ${job.name}`);
    
    try {
      const result = await processJob(job);
      console.log(`[WORKER] Job ${job.id} completed successfully`);
      return result;
    } catch (error: any) {
      console.error(`[WORKER] Job ${job.id} failed:`, error.message);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 3,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  }
);

async function processJob(job: Job) {
  const { type } = job.data;
  
  switch (type) {
    case "process-chunk":
      return await handleChunkProcessing(job);
    default:
      throw new Error(`Unknown job type: ${type}`);
  }
}

function transformLogRecord(record: any, sessionId: string, chunkIndex: number, batchNumber: number, recordIndex: number) {
  // Handle both direct log objects and nested structures
  const logData = record.table ? record : record.log_data || record;
  
  return {
    // Original data fields
    table_name: logData.table || 'log_stats',
    log_id: logData.id || null,
    job_id: logData.job_id || null,
    user_id: logData.user_id || null,
    file_name: logData.file_name || null,
    total_logs: logData.total_logs || 0,
    error_count: logData.error_count || 0,
    warning_count: logData.warning_count || 0,
    info_count: logData.info_count || 0,
    unique_ips: logData.unique_ips || 0,
    keywords_found: logData.keywords_found || null,
    processing_time: logData.processing_time || null,
    original_created_at: logData.created_at ? new Date(logData.created_at).toISOString() : null,
    
    // Session tracking fields
    session_id: sessionId,
    chunk_index: chunkIndex,
    batch_number: batchNumber,
    record_index: recordIndex,
    processed_at: new Date().toISOString()
  };
}

async function handleChunkProcessing(job: Job) {
  const { sessionId, data, chunkInfo } = job.data;
  let totalInserted = 0;
  const errors: any[] = [];
  
  console.log(`[WORKER] Processing chunk ${chunkInfo.chunkIndex}/${chunkInfo.totalChunks} with ${data.length} log records`);
  
  // Process data in smaller batches
  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    
    try {
      // Transform data for log_stats table
      const transformedBatch = batch.map((record: any, index: number) => 
        transformLogRecord(record, sessionId, chunkInfo.chunkIndex, batchNum, i + index)
      );
      
      console.log(`[WORKER] Inserting batch ${batchNum} with ${transformedBatch.length} log records`);
      console.log(`[WORKER] Sample record:`, JSON.stringify(transformedBatch[0], null, 2));
      
      const { data: insertResult, error } = await supabase
        .from('log_stats')
        .insert(transformedBatch)
        .select('id');
      
      if (error) {
        console.error(`[WORKER] Supabase error for batch ${batchNum}:`, {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        errors.push({
          batch: batchNum,
          error: error.message,
          details: error.details,
          sample_record: transformedBatch[0]
        });
        continue;
      }
      
      totalInserted += insertResult?.length || 0;
      console.log(`[WORKER] Successfully inserted batch ${batchNum}: ${insertResult?.length || 0} log records`);
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (batchError: any) {
      console.error(`[WORKER] Exception in batch ${batchNum}:`, batchError.message);
      errors.push({
        batch: batchNum,
        error: batchError.message,
        stack: batchError.stack
      });
    }
  }
  
  // Update chunk progress in Redis
  await updateChunkProgress(sessionId, chunkInfo, data.length, totalInserted, job.timestamp || Date.now());
  
  // Check if this is the last chunk and update session summary
  await updateSessionSummary(sessionId, chunkInfo, data);
  
  const result = {
    status: 'completed',
    sessionId,
    chunkIndex: chunkInfo.chunkIndex,
    totalChunks: chunkInfo.totalChunks,
    recordsProcessed: data.length,
    recordsInserted: totalInserted,
    errorCount: errors.length,
    errors: errors.length > 0 ? errors.slice(0, 5) : undefined // Limit error details
  };
  
  console.log(`[WORKER] Chunk processing complete:`, result);
  return result;
}

async function updateChunkProgress(sessionId: string, chunkInfo: any, processed: number, inserted: number, startTime: number) {
  try {
    const progressKey = `upload_progress:${sessionId}:chunks`;
    const chunkData = {
      chunkIndex: chunkInfo.chunkIndex,
      status: inserted > 0 ? 'completed' : 'failed',
      recordsProcessed: processed,
      recordsInserted: inserted,
      processingTime: Date.now() - startTime,
      completedAt: new Date().toISOString()
    };
    
    await redisConnection.hset(progressKey, chunkInfo.chunkIndex.toString(), JSON.stringify(chunkData));
    await redisConnection.expire(progressKey, 7200); // 2 hours TTL
    
    console.log(`[WORKER] Updated progress for chunk ${chunkInfo.chunkIndex}`);
  } catch (error) {
    console.error(`[WORKER] Failed to update chunk progress:`, error);
  }
}

async function updateSessionSummary(sessionId: string, chunkInfo: any, chunkData: any[]) {
  try {
    const session = uploadSessions[sessionId];
    if (!session || chunkInfo.chunkIndex !== chunkInfo.totalChunks) {
      return; // Not the last chunk
    }
    
    if (session.processingStarted) {
      return; // Already processed
    }
    
    session.processingStarted = true;
    
    // Calculate session statistics from the data
    let totalLogs = 0;
    let totalErrors = 0;
    let totalWarnings = 0;
    let totalInfo = 0;
    const uniqueJobIds = new Set();
    const uniqueUserIds = new Set();
    const fileNames = new Set();
    
    // Get all chunk progress data
    const progressKey = `upload_progress:${sessionId}:chunks`;
    const chunkProgress = await redisConnection.hgetall(progressKey);
    
    let totalInserted = 0;
    let totalProcessed = 0;
    
    Object.values(chunkProgress).forEach(chunkDataStr => {
      try {
        const chunkData = JSON.parse(chunkDataStr);
        totalInserted += chunkData.recordsInserted || 0;
        totalProcessed += chunkData.recordsProcessed || 0;
      } catch (e) {
        console.warn(`[WORKER] Failed to parse chunk progress data:`, e);
      }
    });
    
    // Analyze current chunk data for statistics
    chunkData.forEach((record: any) => {
      const logData = record.table ? record : record.log_data || record;
      totalLogs += logData.total_logs || 0;
      totalErrors += logData.error_count || 0;
      totalWarnings += logData.warning_count || 0;
      totalInfo += logData.info_count || 0;
      
      if (logData.job_id) uniqueJobIds.add(logData.job_id);
      if (logData.user_id) uniqueUserIds.add(logData.user_id);
      if (logData.file_name) fileNames.add(logData.file_name);
    });
    
    // Insert session summary record
    const sessionSummary = {
      table_name: 'session_summary',
      session_id: sessionId,
      total_logs: totalLogs,
      error_count: totalErrors,
      warning_count: totalWarnings,
      info_count: totalInfo,
      keywords_found: {
        session_stats: {
          total_chunks: chunkInfo.totalChunks,
          total_records_processed: totalProcessed,
          total_records_inserted: totalInserted,
          unique_jobs: uniqueJobIds.size,
          unique_users: uniqueUserIds.size,
          unique_files: fileNames.size
        }
      },
      processing_time: `${Math.round((Date.now() - session.stats.processingTimeMs) / 1000)} seconds`,
      processed_at: new Date().toISOString()
    };
    
    const { error } = await supabase
      .from('log_stats')
      .insert([sessionSummary]);
    
    if (error) {
      console.error(`[WORKER] Failed to insert session summary:`, error);
    } else {
      console.log(`[WORKER] Session summary inserted for ${sessionId}`);
    }
    
  } catch (error) {
    console.error(`[WORKER] Error updating session summary:`, error);
  }
}

// Worker event handlers
logWorker.on('ready', () => {
  console.log('[WORKER] Worker is ready to process log jobs');
});

logWorker.on('active', (job) => {
  console.log(`[WORKER] Processing log job ${job.id}`);
});

logWorker.on('completed', (job, result) => {
  console.log(`[WORKER] Log job ${job.id} completed - inserted ${result?.recordsInserted || 0} records`);
});

logWorker.on('failed', (job, err) => {
  console.error(`[WORKER] Log job ${job?.id} failed:`, err.message);
});

logWorker.on('error', (err) => {
  console.error('[WORKER] Worker error:', err);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('[WORKER] Shutting down log worker...');
  await logWorker.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('[WORKER] Shutting down log worker...');
  await logWorker.close();
  process.exit(0);
});

console.log('[WORKER] Log processing worker initialized and ready for log data');

export default logWorker;