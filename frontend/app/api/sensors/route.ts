import pool from "@/lib/db";

interface SensorData {
  rpm: number;
  rpm_ts: string;
  airSpeed: number;
  airSpeed_ts: string;
  temp: number;
  temp_ts: string;
  pressure: number;
  pressure_ts: string;
  status: string;
  status_ts: string;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get("prefix") ?? "closed";


    // return zeros as placeholder api call
    var data : SensorData = {
        rpm: 0,
        rpm_ts: "",
        airSpeed: 0,
        airSpeed_ts: "",
        temp: 0,
        temp_ts: "",
        pressure: 0,
        pressure_ts: "",
        status: "Off",
        status_ts: "",
    }

    // RPM Query
    try {
        const result = await pool.query(
            `SELECT rpm, timestamp
            FROM ${prefix}_tachometer
            ORDER BY timestamp
            DESC LIMIT 1`
        );
        data.rpm = result.rows[0].rpm;
        data.rpm_ts = result.rows[0].timestamp;
    }
    catch (error) {
        console.error('Failed to fetch latest RPM:', error);
        // data.rpm stays 0 as fallback
    }

    // Air Speed Query
    try {
        const result = await pool.query(
            `SELECT air_speed, timestamp
            FROM ${prefix}_pitot_static
            ORDER BY timestamp
            DESC LIMIT 1`
        );
        data.airSpeed = result.rows[0].air_speed;
        data.airSpeed_ts = result.rows[0].timestamp
    }
    catch (error) {
        console.error('Failed to fetch latest air speed:', error);
    }

    // Temperature Query
    try {
        const result = await pool.query(
            `SELECT temp_celsius, timestamp
            FROM ${prefix}_thermometer
            ORDER BY timestamp
            DESC LIMIT 1`
        );
        data.temp = result.rows[0].temp_celsius;
        data.temp_ts = result.rows[0].timestamp;
    }
    catch (error) {
        console.error('Failed to fetch latest temperature:', error);
    }

    // Pressure Query
    try {
        const result = await pool.query(
            `SELECT pressure_hpa, timestamp
            FROM ${prefix}_barometer
            ORDER BY timestamp
            DESC LIMIT 1`
        );
        data.pressure = result.rows[0].pressure_hpa;
        data.pressure_ts = result.rows[0].timestamp;
    }
    catch (error) {
        console.error('Failed to fetch latest pressure:', error);
    }

    // Status Query
    try {
        const result = await pool.query(
            `SELECT status, timestamp
            FROM ${prefix}_status
            ORDER BY timestamp
            DESC LIMIT 1`
        );
        data.status = result.rows[0].status;
        data.status_ts = result.rows[0].timestamp;
    }
    catch (error) {
        console.error('Failed to fetch latest status:', error);
    }



    return Response.json(data);
}