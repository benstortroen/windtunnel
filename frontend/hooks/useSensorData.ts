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

  // call API every 1 second refresh sensor data
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/sensors?prefix=${prefix}`);
      const json: SensorData = await res.json();
      setData(json);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return data;
}