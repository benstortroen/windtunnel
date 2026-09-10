"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {useEffect, useState} from "react";
import { usePathname } from "next/navigation";

type ChartProps = {
    selectedRange : string;
    selectedMetric : string;
}

const MIN_METRIC : Record<string, number> = {
    "RPM": 0,
    "Air Speed": 0,
    "Temp": 15,
    "Pressure": 950
}

const MAX_METRIC : Record<string, number> = {
    "RPM": 1000,
    "Air Speed": 50,
    "Temp": 35,
    "Pressure": 1000
}

const UNIT_METRIC : Record<string, string> = {
    "RPM": "rpm",
    "Air Speed": "m/s",
    "Temp": "C",
    "Pressure": "hPa",
}

export default function Chart({selectedRange, selectedMetric} : ChartProps) {

    const [chartData, setChartData] = useState([]);
    const [chartMin, setChartMin] = useState(0);
    const [chartMax, setChartMax] = useState(1000);

    // determine which table prefix to use based on url
    const pathname = usePathname();
    const prefix = pathname.includes("/open-return")
      ? "open"
      : "closed";


    // pull new chart data when selectedRange changes
    useEffect(() => {
      // ignore flag is to prevent old data from displaying when user clicks buttons fast
      let ignore = false;
      let interval: ReturnType<typeof setInterval> | undefined;

      // API CALL WITH RANGE AS A SEARCH PARAMETER
      const fetchData = async () => {
          try {
            // get data points from api route, pass selectedRange as a search parameter
            const res = await fetch(`/api/chart?prefix=${prefix}&range=${selectedRange}&metric=${selectedMetric}`);
            // error check, zero-out data points
            if (!res.ok) {
              console.error(`Failed to load chart data: ${res.status} ${res.statusText}`);
              setChartData([]);
              return;
            }
            // apply new data points to chart
            const data = await res.json();
            setChartData(data);
            setChartMin(MIN_METRIC[selectedMetric]);
            setChartMax(MAX_METRIC[selectedMetric]);
          }
            // error check, zero-out data points
            catch (err) {
            console.error("Network error fetching chart data", err);
            setChartData([]);
          }
      };
      //
      fetchData();

      // Update live data every 1 second
      if (selectedRange === "LIVE"){
        interval = setInterval(fetchData, 1000);
      }

      return () => {
        ignore = true; // runs when selectedRange changes again or component unmounts
        if (interval) {clearInterval(interval);}
      };
    }, [selectedRange, selectedMetric]);

    // change timestamp information depending on range length
    function formatTimestamp(t: string, range: string) {
      const date = new Date(t);
      // less than a day
      if (range === "LIVE" || range === "5M" || range === "1H") {
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      }
      // 1 day - 1 week
      if (range === "24H" || range === "1D" || range === "1W") {
        return date.toLocaleString();
      }
      // anything a month or longer
      return new Date(t).toLocaleDateString()
    }

  return (
  <div
    style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    <div style={{ width: '90%', height: '90%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
          <XAxis label="Time" dataKey="timestamp" stroke="#666" interval={47} tick={false}/>
          <YAxis
              label={{
                  value: selectedMetric + " (" + UNIT_METRIC[selectedMetric] + ")",
                  angle: -90,
                  position: 'insideLeft',
                  textAnchor: 'middle'
              }}
              width={80}
            stroke="#666"
            domain={[chartMin, chartMax]}
          />
          <Tooltip
            cursor={{ stroke: '#ccc' }}
            contentStyle={{
              backgroundColor: '#fff',
              borderColor: '#ccc',
            }}
            labelFormatter={(t) => typeof t === 'string' ? formatTimestamp(t, selectedRange) : ''}
            labelStyle={{ color: '#000' }}   // the top line (your "name"/timestamp)
            itemStyle={{ color: '#000' }}    // each data line below (e.g. "rpm: 4200")
          />

          <Line
            type="linear"
            dataKey="value"
            stroke="var(--primary)"
            strokeWidth={3}
            dot={false}
            activeDot={{ stroke: '#fff' }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
</div>
  );
}