# SwitchSync

A first-year engineering CTI project: a polished web-based smart-home monitoring and control **simulation**.

## What it is
- 100% website-based prototype
- No Arduino, ESP32, sensors, relays, or mains wiring
- Dashboard for many household appliances
- ON/OFF simulation, Away Mode, alerts, energy estimates, activity log
- Local Express backend with `/api/health` and `/api/info`
- State persists in the browser with localStorage

## Run locally
1. Install Node.js LTS from https://nodejs.org/
2. Open a terminal in this folder.
3. Run `npm install`
4. Run `npm start`
5. Open `http://localhost:3000`
6. Stop with `Ctrl+C`.

## Important academic note
This prototype simulates device states. It does not directly control real household electrical appliances. For a future version, an IoT layer could connect the same dashboard to authenticated hardware APIs.
