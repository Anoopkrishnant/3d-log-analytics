"use client";
import { useState, useEffect } from 'react';
import { LogStats } from '../types';

export function useLogStats() {
  const [logStats, setLogStats] = useState<LogStats[]>([]);  

  useEffect(() => {
    async function fetchData() {
      const res = await fetch('/api/v1/stats');
      const json = await res.json();
      setLogStats(json.logStats ?? []);
    }
    fetchData();
  }, []);

  return logStats;
}
