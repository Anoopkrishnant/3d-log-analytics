"use client";
import { useEffect, useState } from 'react';
import { LogData, FrameData } from '../types';

export function useAnimatedLogData(jobId: string) {
  const [spatialData, setSpatialData] = useState<LogData[]>([]);
  const [frames, setFrames] = useState<FrameData[][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [spatialRes, framesRes] = await Promise.all([
          fetch(`/api/v1/spatial-data/${jobId}`),
          fetch(`/api/v1/animation-frames/${jobId}`),
        ]);
        if (!spatialRes.ok || !framesRes.ok) throw new Error('API error');
        const spatialData = await spatialRes.json();
        const framesData = await framesRes.json();
        setSpatialData(spatialData ?? []);
        setFrames(framesData ?? []);
      } catch (e) {
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [jobId]);

  return { spatialData, frames, loading, error };
}
