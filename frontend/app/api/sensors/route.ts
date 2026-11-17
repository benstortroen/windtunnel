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

// latest-reading query for each sensor table
const QUERIES = {
    rpm: "SELECT rpm AS value, timestamp FROM {prefix}_tachometer ORDER BY timestamp DESC LIMIT 1",
    airSpeed: "SELECT air_speed AS value, timestamp FROM {prefix}_pitot_static ORDER BY timestamp DESC LIMIT 1",
    temp: "SELECT temp_celsius AS value, timestamp FROM {prefix}_thermometer ORDER BY timestamp DESC LIMIT 1",
    pressure: "SELECT pressure_hpa AS value, timestamp FROM {prefix}_barometer ORDER BY timestamp DESC LIMIT 1",
    status: "SELECT status AS value, timestamp FROM {prefix}_status ORDER BY timestamp DESC LIMIT 1",
} as const;

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get("prefix") ?? "closed";

    // reject invalid prefixes (prefix is part of the table name)
    if (prefix !== "open" && prefix !== "closed") {
        return Response.json({ error: "Invalid prefix" }, { status: 400 });
    }

    // zeros / "Off" are the fallback for any sensor whose query fails
    const data: SensorData = {
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
    };

    // run all queries in parallel
    const keys = Object.keys(QUERIES) as (keyof typeof QUERIES)[];
    const results = await Promise.allSettled(
        keys.map((key) => pool.query(QUERIES[key].replace("{prefix}", prefix)))
    );

    results.forEach((result, i) => {
        const key = keys[i];
        const row = result.status === "fulfilled" ? result.value.rows[0] : undefined;
        if (!row) {
            console.error(`Failed to fetch latest ${key}:`,
                result.status === "rejected" ? result.reason : "no rows");
            return;
        }
        (data[key] as SensorData[typeof key]) = row.value;
        data[`${key}_ts`] = row.timestamp;
    });

    return Response.json(data);
}
