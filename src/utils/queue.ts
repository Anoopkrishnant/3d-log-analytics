import { Queue, JobsOptions, Job } from "bullmq";
import { redisConnection } from "@/utils/redis";

export const logProcessingQueue = new Queue("log-processing", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

export async function addLogProcessingJob(
  name:
    | "insert-row"
    | "process-chunk"
    | "process-stream-chunk"
    | "coordinate-upload"
    | "coordinate-stream-upload"
    | "cleanup"
    | "health-check",
  data: any,
  opts: JobsOptions = {}
): Promise<Job> {
  const jobData = { type: name, ...data, createdAt: Date.now() };

  const job = await logProcessingQueue.add(name, jobData, { ...opts, priority: getJobPriority(name) });

  console.log(`[QUEUE] Added ${name} job ${job.id} (session: ${data?.sessionId || ""}, rows: ${Array.isArray(data?.data) ? data.data.length : "?"})`);

  return job;
}

function getJobPriority(jobType: string): number {
  const priorities: Record<string, number> = {
    "coordinate-upload": 1,
    "coordinate-stream-upload": 1,
    "process-chunk": 5,
    "process-stream-chunk": 5,
    "insert-row": 5,
    cleanup: 10,
    "health-check": 10,
  };

  return priorities[jobType] ?? 5;
}

export { logProcessingQueue as queue };
