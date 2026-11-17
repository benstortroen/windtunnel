"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface SensorData {
  rpm: number;
  rpm_ts: string;
  airSpeed: number;
  airSpeed_ts: string;
  temp: number;
  temp_ts: string;
  pressure: number;
  pressure_ts: string;
  status: string;
  status_ts: string;
}

export function useSensorData(): SensorData {
  const [data, setData] = useState<SensorData>({
    rpm: 0,
    rpm_ts: "",
    airSpeed: 0,
    airSpeed_ts: "",
    temp: 0,
    temp_ts: "",
    pressure: 0,
    pressure_ts: "",
    status: "Off",
    status_ts: "",
  });

  // determine which table prefix to use based on url
  const pathname = usePathname();
  const prefix = pathname.includes("/open-return")
      ? "open"
      : "closed";

  // refresh sensor data: fetch immediately, then 1 second after each response
  // arrives, so a slow server never causes requests to pile up
  useEffect(() => {
    let stopped = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const controller = new AbortController();

    const poll = async () => {
      try {
        const res = await fetch(`/api/sensors?prefix=${prefix}`, { signal: controller.signal });
        if (res.ok) {
          const json: SensorData = await res.json();
          if (!stopped) setData(json);
        }
      } catch (err) {
        if (!stopped) console.error("Failed to fetch sensor data", err);
      }
      if (!stopped) timeout = setTimeout(poll, 1000);
    };

    poll();

    return () => {
      stopped = true;
      controller.abort();
      if (timeout) clearTimeout(timeout);
    };
  }, [prefix]);

  return data;
}
