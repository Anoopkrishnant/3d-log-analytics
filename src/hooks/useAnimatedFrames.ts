import { useEffect, useState } from "react";

export function useAnimatedLogData() {
  const [data, setData] = useState([]);
  useEffect(() => {
    fetch('/api/v1/animation-frames')
      .then(r => r.json())
      .then(r => setData(r.logStats || []));
  }, []);
  return data;
}