"use client";

import { ReactNode, useState, useEffect, useRef } from "react";
import Card from "@/components/Card";

const STREAM_URL = "https://cam.magmac4.com/?action=stream";
const RETRY_DELAY_MS = 3000;

type WebcamProps = {
    children?: ReactNode;
};

export default function Webcam({ children }: WebcamProps){

    // changing this key forces the browser to open a new stream connection
    const [streamKey, setStreamKey] = useState(Date.now());
    const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    function reconnect() {
        setStreamKey(Date.now());
    }

    // retry after a short delay when the stream drops
    function handleError() {
        if (retryTimer.current) clearTimeout(retryTimer.current);
        retryTimer.current = setTimeout(reconnect, RETRY_DELAY_MS);
    }

    // reconnect when the tab becomes visible again or the network comes back,
    // since the browser may have silently dropped the stream in the meantime
    useEffect(() => {
        function handleVisibility() {
            if (document.visibilityState === "visible") reconnect();
        }

        document.addEventListener("visibilitychange", handleVisibility);
        window.addEventListener("online", reconnect);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibility);
            window.removeEventListener("online", reconnect);
            if (retryTimer.current) clearTimeout(retryTimer.current);
        };
    }, []);

    return (

        <Card className="col-span-2 lg:col-span-1 relative overflow-hidden min-h-[375px]">
            <img src={`${STREAM_URL}&t=${streamKey}`} alt="Live camera"
                 onError={handleError}
                 className="absolute inset-4 w-[calc(100%-2rem)] h-[calc(100%-2rem)] rounded-lg object-cover"/>

            {/* content overlaid in the top left corner of the stream */}
            <div className="absolute top-0 left-0">
                {children}
            </div>
        </Card>
    )

}
