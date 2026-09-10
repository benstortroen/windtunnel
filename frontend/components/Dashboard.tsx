// components/Dashboard.tsx

"use client"

import { useSensorData } from "@/hooks/useSensorData";
import Card from "@/components/Card";
import StatusBox from "@/components/StatusBox";
import ChartContainer from "@/components/ChartContainer";
import GaugeCard from "@/components/GaugeCard";
import DashboardHeader from "@/components/DashboardHeader";

const RPM_UNITS = [
    { label: 'RPM', convert: (v: number) => v, decimalPlaces: 0}
];

const AIR_SPEED_UNITS = [
    { label: 'm/s', convert: (v: number) => v, decimalPlaces: 3},
    { label: 'mph', convert: (v: number) => v * 2.23694, decimalPlaces: 3}
];

const TEMP_UNITS = [
    { label: 'C', convert: (v: number) => v, decimalPlaces: 2},
    { label: 'F', convert: (v: number) => v * 9 / 5 + 32, decimalPlaces: 2}
];

const PRESSURE_UNITS = [
    { label: 'kPa', convert: (v: number) => v / 10, decimalPlaces: 2},
    { label: 'MPa', convert: (v: number) => v / 10000, decimalPlaces: 5},
    { label: 'atm', convert: (v: number) => v / 1013.25, decimalPlaces: 4}
];

export default function Dashboard() {
    // update sensor values using api function (aka hook)
    const { rpm, rpm_ts, airSpeed, airSpeed_ts, temp, temp_ts, pressure, pressure_ts, status, status_ts} = useSensorData();

return (
    // display Dashboard as grid of cards

    <div className="min-h-screen flex flex-col">
        <DashboardHeader/>

        <div className="grid grid-cols-2 gap-4 p-4 flex-1">
            {/* Wind Tunnel Running Status */}
            <Card className="col-span-2 lg:col-span-1"><StatusBox value={status} ts={status_ts}/></Card>

            {/* Historical Data Chart */}
            <Card className="col-span-2 lg:col-span-1 min-h-[375px] pb-8"><ChartContainer/></Card>

            {/* RPM and Air Speed Gauges */}
            <div className="flex flex-col gap-4">
                <GaugeCard title="Motor" value={rpm} ts={rpm_ts} units={RPM_UNITS}/>
                <GaugeCard title="Air Speed" value={airSpeed} ts={airSpeed_ts} units={AIR_SPEED_UNITS}/>
            </div>

            {/* Temperature and Pressure Gauges */}
            <div className="flex flex-col gap-4">
                <GaugeCard title="Temperature" value={temp} ts={temp_ts} units={TEMP_UNITS}/>
                <GaugeCard title="Pressure" value={pressure} ts={pressure_ts} units={PRESSURE_UNITS}/>
            </div>
        </div>
    </div>
  );
}