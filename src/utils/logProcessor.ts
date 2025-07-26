
export async function processLogFile(jobData: {
  filePath: string
  jobId: string
  userId: string
  fileName: string
}) {
  
  await new Promise(r => setTimeout(r, 2000))
  return { message: 'Processing complete', jobId: jobData.jobId, file: jobData.fileName }
}
