A service file instructs a computer to run terminal commands automatically (e.g. on startup).

NOTE: The sensors (tachometer, barometer, pitot-static, thermometer, status) do NOT use
service files. They run as docker compose containers with `restart: unless-stopped`, so the
docker daemon restarts them on boot. 

Service files in this folder:
- webserver-windtunnel.service: runs the website on the web server
- wt-camera-stream.service: streams the camera to YouTube Live (see setup/camera/README.md)

To enable a service file:
- copy the service file to /etc/systemd/system
- reload systemd so it sees the new file
- enable and start the service
- check status of service to make sure its running

Commands (replace example.service with the file name):
- sudo cp example.service /etc/systemd/system/
- sudo systemctl daemon-reload
- sudo systemctl enable --now example.service
- sudo systemctl status example.service
