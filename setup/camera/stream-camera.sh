#!/bin/sh
set -eu

# Reads YOUTUBE_STREAM_KEY from the environment (see wt-camera-stream.service's
# EnvironmentFile) and pushes the camera to YouTube Live as a single RTMP stream,
# regardless of how many people are watching the website.
#
# Adjust -video_size / -framerate / the /dev/videoX device below to whatever
# `v4l2-ctl --list-devices` and `ffmpeg -f v4l2 -list_formats all -i /dev/video0`
# show the camera actually supports (see setup/camera/README.md).

# Hardware H.264 encoder (Raspberry Pi 3/4). If `ffmpeg -encoders | grep v4l2m2m`
# doesn't list h264_v4l2m2m (e.g. on a Pi 5), replace the -c:v line below with:
#   -c:v libx264 -preset veryfast -tune zerolatency -b:v 2500k -maxrate 2500k -bufsize 5000k -g 60 -pix_fmt yuv420p
exec ffmpeg -f v4l2 -input_format mjpeg -video_size 1280x720 -framerate 30 -i /dev/video0 \
    -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 \
    -c:v h264_v4l2m2m -b:v 2500k -maxrate 2500k -bufsize 5000k -g 60 -pix_fmt yuv420p \
    -c:a aac -b:a 128k \
    -f flv "rtmp://a.rtmp.youtube.com/live2/${YOUTUBE_STREAM_KEY}"
