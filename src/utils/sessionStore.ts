export interface UploadSessionStats {
  totalRows: number;
  validRows: number;
  malformedCount: number;
  chunksCreated: number;
  processingTimeMs: number;
}

export interface UploadSession {
  entries: any[];
  stats: UploadSessionStats;
  totalChunks?: number;
  receivedChunks?: number;
  processingStarted?: boolean;
}

export const uploadSessions: Record<string, UploadSession> = {};
