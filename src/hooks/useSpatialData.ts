import { useEffect, useState } from "react";

export function useSpatialData() {
  const [data, setData] = useState([]);
  useEffect(() => {
    fetch('/api/v1/spatial-data')
      .then(r => r.json())
      .then(r => setData(r.logStats || []));
  }, []);
  return data;
}