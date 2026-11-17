-- Indexes so "ORDER BY timestamp DESC LIMIT 1" (latest reading) and the chart's
-- time-range queries use an index instead of scanning entire sensor tables.
-- CONCURRENTLY lets sensors keep inserting while the index builds. Run each
-- statement on its own (not inside a transaction), e.g.:
--   psql -h db.magmac4.com -U <user> -d <db> -f add-timestamp-indexes.sql
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_closed_pitot_static_timestamp ON closed_pitot_static (timestamp);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_closed_barometer_timestamp    ON closed_barometer (timestamp);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_closed_status_timestamp       ON closed_status (timestamp);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_open_tachometer_timestamp     ON open_tachometer (timestamp);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_open_pitot_static_timestamp   ON open_pitot_static (timestamp);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_open_thermometer_timestamp    ON open_thermometer (timestamp);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_open_barometer_timestamp      ON open_barometer (timestamp);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_open_status_timestamp         ON open_status (timestamp);
