export interface LogData {
  id: string;
  type: 'error' | 'info' | 'warning';
  severity?: number;
  timestamp: number;
  position?: { x: number; y: number; z: number };
  [key: string]: any; // additional dynamic fields
}

export interface FrameData {
  id: string;
  position?: { x: number; y: number; z: number };
  // Add other animated properties as needed
}

export interface AnimatedLogApiResponse {
  frames: FrameData[][];
  spatial: LogData[];
}

export interface LogStats {
  id: string;
  job_id: string;
  user_id: string;  
  file_name: string;
  total_logs: number;
  error_count: number;
  warning_count: number;
  info_count: number;
  unique_ips: number;
  keywords_found: any;        
  processing_time: string;  
  created_at: string;        
}