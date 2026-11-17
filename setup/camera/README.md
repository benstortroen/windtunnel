# Wind Tunnel Camera -> YouTube Live

Replaces the old mjpg-streamer + Cloudflare Tunnel setup. The Pi pushes one
RTMP stream to YouTube Live regardless of how many people are watching the
website; YouTube's CDN and player handle distribution, adaptive bitrate, and
buffering. The website embeds the channel's current live broadcast (see
`frontend/components/Webcam.tsx`).

## 1. One-time YouTube setup (in YouTube Studio)

1. Enable live streaming for the channel if not already (Studio -> Settings ->
   Channel -> Feature eligibility). First-time enablement can take up to ~24h.
2. Create a live stream with a **reusable/persistent stream key**
   (Studio -> "Go Live" -> Stream tab -> create a stream). Note down:
   - RTMP ingest URL: `rtmp://a.rtmp.youtube.com/live2`
   - The stream key (secret - treat like a password)
   - The channel ID (Studio -> Settings -> Channel -> Advanced settings ->
     "Channel ID", starts with `UC...`) - this is the public value that goes
     in the website's `NEXT_PUBLIC_YOUTUBE_CHANNEL_ID` env var.
3. Set visibility to **Unlisted** (recommended) or Public. Confirm "Allow
   embedding" is on (default).
4. As long as the broadcast is never manually "ended" in Studio, reconnecting
   the RTMP push (e.g. after a Pi reboot) resumes the *same* broadcast/video
   ID within YouTube's reconnection grace window - this is why the
   channel-based embed + a long-lived systemd service work well together.

## 2. Raspberry Pi (`windtunnel-5`) setup

1. SSH into `windtunnel-5`.
2. Stop whatever currently runs mjpg-streamer (however it was started per the
   TechsPassion tutorial - a systemd service or startup script) and
   stop/disable it. Most USB webcams only allow one process to hold
   `/dev/video0` open at a time, so mjpg-streamer and this ffmpeg pipeline
   cannot run at the same time against the same camera.
3. Install ffmpeg and v4l-utils:
   ```
   sudo apt update && sudo apt install -y ffmpeg v4l-utils
   ```
4. Identify the camera device and what it supports (reuse whatever
   device/resolution mjpg-streamer was already using successfully):
   ```
   v4l2-ctl --list-devices
   ffmpeg -f v4l2 -list_formats all -i /dev/video0
   ```
5. Check for hardware H.264 encoding (lighter on the Pi's CPU than software
   encoding - available on Pi 3/4, not on Pi 5):
   ```
   ffmpeg -encoders 2>/dev/null | grep v4l2m2m
   ```
   If `h264_v4l2m2m` is listed, `stream-camera.sh` already uses it. Otherwise,
   edit `stream-camera.sh` and swap the `-c:v` line for the libx264 fallback
   described in its comments.
6. Store the YouTube stream key outside of git, in a root-only file on the Pi:
   ```
   sudo tee /etc/windtunnel-camera-stream.env > /dev/null <<'EOF'
   YOUTUBE_STREAM_KEY=paste-the-real-key-here
   EOF
   sudo chmod 600 /etc/windtunnel-camera-stream.env
   ```
7. Pull this repo on the Pi (or copy `setup/camera/stream-camera.sh` and
   `setup/service/wt-camera-stream.service` over), then edit
   `wt-camera-stream.service` to replace `<pi-user>` with the actual username
   and adjust `stream-camera.sh`'s device/resolution/framerate if step 4 found
   something different from the defaults.
8. Enable and start the service:
   ```
   sudo cp setup/service/wt-camera-stream.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable --now wt-camera-stream
   sudo systemctl status wt-camera-stream
   journalctl -u wt-camera-stream -f
   ```
9. Confirm in YouTube Studio that the stream health shows "Good"/live, then
   click "Go Live" the first time. After that, the service just needs to stay
   running - Studio doesn't need to be touched again on restarts.
10. Bandwidth starting point: 720p30 at ~2.5 Mbps video + 128 kbps audio
    (~2.6 Mbps total) is a safe default for most home upload connections;
    YouTube recommends roughly 1.5x that in actual upload headroom. If the
    home connection's upload is constrained, drop resolution/bitrate rather
    than framerate.
11. Cleanup (recommended, optional): once the YouTube pipeline is confirmed
    working, remove/narrow the Cloudflare Tunnel's public ingress rule for
    `cam.magmac4.com` - the website no longer needs the camera reachable from
    the public internet directly.

## 3. Website side

Set `NEXT_PUBLIC_YOUTUBE_CHANNEL_ID` wherever `DB_HOST` etc. already live - the
gitignored `frontend/.env` on the home server - since Next.js inlines
`NEXT_PUBLIC_*` vars at `next build` time. Then redeploy as normal (push to
`main`).

