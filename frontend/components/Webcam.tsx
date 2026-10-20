"use client";

import { ReactNode, useState, useEffect } from "react";
import Card from "@/components/Card";

const SNAPSHOT_URL = "https://cam.magmac4.com/?action=snapshot";
const REFRESH_INTERVAL_MS = 5000;

type WebcamProps = {
    children?: ReactNode;
};

export default function Webcam({ children }: WebcamProps){

    // url of the most recent snapshot that finished loading
    const [snapshotSrc, setSnapshotSrc] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        // load the next snapshot off-screen and only swap it in once it has
        // finished loading, so the image never flickers or goes blank
        function fetchSnapshot() {
            // skip while the tab is hidden to avoid pulling frames nobody sees
            if (document.visibilityState !== "visible") return;

            const src = `${SNAPSHOT_URL}&t=${Date.now()}`;
            const next = new Image();
            next.onload = () => {
                if (!cancelled) setSnapshotSrc(src);
            };
            // on error keep showing the last snapshot, the next tick retries
            next.src = src;
        }

        fetchSnapshot();
        const interval = setInterval(fetchSnapshot, REFRESH_INTERVAL_MS);

        // grab a fresh snapshot right away when the tab becomes visible again
        function handleVisibility() {
            if (document.visibilityState === "visible") fetchSnapshot();
        }
        document.addEventListener("visibilitychange", handleVisibility);

        return () => {
            cancelled = true;
            clearInterval(interval);
            document.removeEventListener("visibilitychange", handleVisibility);
        };
    }, []);

    return (

        <Card className="col-span-2 lg:col-span-1 relative overflow-hidden min-h-[375px]">
            {snapshotSrc && (
                <img src={snapshotSrc} alt="Camera snapshot"
                     className="absolute inset-4 w-[calc(100%-2rem)] h-[calc(100%-2rem)] rounded-lg object-cover"/>
            )}

            {/* content overlaid in the top left corner of the snapshot */}
            <div className="absolute top-0 left-0">
                {children}
            </div>
        </Card>
    )

}
