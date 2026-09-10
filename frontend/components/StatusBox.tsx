"use client";

import {useState, useEffect, JSX} from "react";
import { usePathname } from "next/navigation";
import {Status} from "next/dist/next-devtools/dev-overlay/components/devtools-indicator/status-indicator";

type StatusBoxProps = {
    value: string;
    ts: string;
}

export default function StatusBox({value, ts} : StatusBoxProps) {

    // variable that keeps track of text color
    const [textColor, setTextColor] = useState("text-primary");
    const [bgColor, setBgColor] = useState("bg-primary");

    // determine which table prefix to use based on url
    const pathname = usePathname();
    const prefix = pathname.includes("/open-return")
      ? "open"
      : "closed";


    // change text color when state changes
    // this could probably change to be a map
    useEffect(() => {
        if (value == "Running"){
            setTextColor("text-green-500")
            setBgColor("bg-green-500")
        }
        else if (value == "Standby"){
            setTextColor("text-secondary")
            setBgColor("bg-secondary")
        }
        else if (value == "Off"){
            setTextColor("text-primary")
            setBgColor("bg-primary")
        }
    }, [value])

    // take the timestamp of the latest status readying and
    // translate it to a legible format
    function formattedTimeAgo(timestamp: string): string {
        // return blank timestamp if no timestamp exists
        if (!timestamp) {return "00:00:00";}

        // get time since timestamp and store in variables
        const diffMs = Date.now() - new Date(timestamp).getTime();
        const seconds = Math.floor(diffMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        // construct a legible timer in the format HH:MM:SS
        const hours_str = hours.toString().padStart(2, "0")
        const minutes_str = (minutes % 60).toString().padStart(2, "0")
        const seconds_str = (seconds % 60).toString().padStart(2, "0")

        return `${hours_str}:${minutes_str}:${seconds_str}`
    }

    return (
        <div>
            <p className="text-2xl text-title"> Wind Tunnel Status</p>
            <p className={`text-4xl md:text-6xl font-bold ${textColor}`}>
                {value}
                <span className={`inline-block align-middle text-white text-lg mx-2 md:mx-4 ${bgColor} rounded-md p-1 `}>
                      {formattedTimeAgo(ts)}
                </span>
            </p>
        </div>

    );
}