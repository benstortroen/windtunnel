# status.py
# Run this on a raspberry pi with a connected Analog-to-Digital Converter
# Insert into table only when status changes
# timestamp, status

# Three possible status for wind tuneel
# off ==> No voltage from panel
# standby ==>  Voltage from panel, rpm == 0
# running ==>


import psycopg2                 # PostgreSQL
from psycopg2 import sql        # PostgreSQL
import time                     # sleep
import sys                      # exit early
import os                       # .env
from dotenv import load_dotenv  # .env
import board                                        # ADC
import adafruit_pcf8591.pcf8591 as PCF              # ADC
from adafruit_pcf8591.analog_in import AnalogIn     # ADC
from adafruit_pcf8591.analog_out import AnalogOut   # ADC

# ==============================================================================
# Helper Functions

# global variables monitoring status
previous_status = "imdifferentsothefirstentryinthedatabaseonrebootisoff"
current_status = "Off"

# Return the online status of the Wind Tunnel with two factors
# 1) Wind Tunnel Panel voltage
# 2) The lastest motor rpm
# Case 1) Off = voltage < 0.1
# Case 2) Standby = voltage >= 0.1, and rpm = 0
# Case 3) Running = voltage >= 0.1, and rpm > 0
def check_status():
    # Read voltage from analog channel
    raw_value = pcf_in_0.value
    scaled_value = (raw_value / 65535) * pcf_in_0.reference_voltage
    print(f"Voltage for current reading: {scaled_value}")

    # Wind Tunnel ON / OFF Determination
    is_wind_tunnel_on = (scaled_value > 1)

    # Declare which wind tunnel table to insert into (depends on .env file)
    is_closed = os.getenv("DB_TABLE") == "closed"
    if is_closed:
        TABLE_NAME = "closed_tachometer"
    else:
        TABLE_NAME = "open_tachometer"

    # Fetch latest rpm and timestamp from database
    sql_select = psycopg2.sql.SQL("SELECT rpm, timestamp FROM {table} ORDER BY timestamp DESC LIMIT 1").format(
        table=psycopg2.sql.Identifier(TABLE_NAME)
    )
    cursor.execute(sql_select)
    row = cursor.fetchone()
    rpm = row[0] if row else 0
    timestamp = row[1] if row else 0
    # Determine if rpm is outdated (>10 seconds ago)
    is_within_ten_seconds = False
    if row:
        timestamp_epoch = timestamp.timestamp()
        is_within_ten_seconds = time.time() - timestamp_epoch < 10

    # Case 1
    if not is_wind_tunnel_on:
        status = "Off"
    # Case 2
    elif rpm == 0 or not is_within_ten_seconds:
        status = "Standby"
    # Case 3
    else:
        status = "Running"

    return status


def insert_db(status):
    # Declare which wind tunnel table to insert into (depends on .env file)
    is_closed = os.getenv("DB_TABLE") == "closed"
    if is_closed:
        TABLE_NAME = "closed_status"
    else:
        TABLE_NAME = "open_status"

    # Insert data into database
    sql_insert = psycopg2.sql.SQL("INSERT INTO {table} (status) VALUES (%s)").format(
        table=psycopg2.sql.Identifier(TABLE_NAME)
    )

    print(f"Inserting status: {status} readings into table: {TABLE_NAME}...")
    cursor.execute(sql_insert, (status,)) # execute insert command
    connection.commit() # save changes to database


# ==============================================================================
# Setup SQL connection
try:
    # Load .env file as os.getenv
    if not load_dotenv():
        raise Exception("Failed to load .env file")

    # Connect to existing database
    print("Connecting to PostgreSQL database...")
    connection = psycopg2.connect(
        host=os.getenv("DB_HOST"),
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        port=os.getenv("DB_PORT")
    )

    # Create a cursor to perform database operations
    cursor = connection.cursor()

except Exception as error:
    print("Error while connecting to PostgreSQL", error)
    sys.exit(1)  # stop the program, error code 1

# ==============================================================================
# Setup microcontroller
i2c = board.I2C()
pcf = PCF.PCF8591(i2c)
pcf_in_0 = AnalogIn(pcf, PCF.A1) # insert panel wire into A1 on ADC !!!


# ==============================================================================
# Main Loop
try:
    while True:
        try:
            # insert new status into database on rising edge only
            current_status = check_status()
            if current_status != previous_status:
                insert_db(current_status)
            previous_status = current_status
            # sleepy time
            time.sleep(1)
        except Exception as error:
            print("Error while reading from sensor or inserting to database: ", error)
            connection.rollback()

except KeyboardInterrupt:
    print("Stopped by user")

# Close out all connections
finally:
    if cursor:
        cursor.close()
    if connection:
        connection.close()
        print("PostgreSQL connection closed")




