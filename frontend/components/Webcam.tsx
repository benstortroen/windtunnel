"use client";

import { ReactNode, useEffect, useState } from "react";
import Card from "@/components/Card";

const CHANNEL_ID = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID;

type WebcamProps = {
    children?: ReactNode;
    showVideo?: boolean;
};

export default function Webcam({ children, showVideo = true }: WebcamProps) {

    // Don't start loading the embed until the rest of the page has finished
    // loading, so a slow stream never delays the page's own load event
    const [ready, setReady] = useState(
        () => typeof document !== "undefined" && document.readyState === "complete"
    );

    useEffect(() => {
        if (ready) return;
        const onLoad = () => setReady(true);
        window.addEventListener("load", onLoad);
        return () => window.removeEventListener("load", onLoad);
    }, [ready]);

    return (

        <Card className="col-span-2 lg:col-span-1 relative overflow-hidden min-h-[375px]">
            {showVideo && ready && CHANNEL_ID && (
                <iframe
                    src={`https://www.youtube-nocookie.com/embed/live_stream?channel=${CHANNEL_ID}&autoplay=1&mute=1&playsinline=1&controls=0&disablekb=1`}
                    title="Wind tunnel camera"
                    loading="lazy"
                    allow="autoplay; encrypted-media"
                    style={{ border: 0, pointerEvents: "none" }}
                    className="absolute inset-4 w-[calc(100%-2rem)] h-[calc(100%-2rem)] rounded-lg"
                />
            )}

            {/* content overlaid in the top left corner of the stream */}
            <div className="absolute top-0 left-0">
                {children}
            </div>
        </Card>
    )

}
