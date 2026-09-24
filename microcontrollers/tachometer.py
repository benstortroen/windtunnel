# tachometer.py
# Run this file on the raspberry pi with a connected IR sensor
# Insert the windtunnel motor RPM into PostgreSQL database
# Use IR Sensor to measure RPM


import psycopg2                 # PostgreSQL
from psycopg2 import sql        # PostgreSQL
import time                     # sleep
import sys                      # exit early
import os                       # .env
from dotenv import load_dotenv  # .env
from gpiozero import DigitalInputDevice # IR sensor

# ==============================================================================
# Helper Functions

def get_rpm() -> int:
    # Time since measurement attempt started
    # Used exclusively for timeout checking
    function_ts = time.time_ns()

    def has_timeout() -> bool:
        return (time.time_ns() - function_ts) > (TIMEOUT * NANO_TO_SECONDS)

    def block_until_rising_edge() -> bool:
        while ir_sensor.is_active:
            if has_timeout(): return False
        while not ir_sensor.is_active:
            if has_timeout(): return False
        return True


    # Calculate rpm by measuring start and end rotation timestamps
    if not block_until_rising_edge():
        return 0  # Timeout
    start_ts = time.time_ns()
    time.sleep(0.001) # PREVENTS EXTREMELY HUGE NUMBERS
    if not block_until_rising_edge():
        return 0 # Timeout
    end_ts = time.time_ns()
    elapsed_ns = end_ts - start_ts
    rpm = NANO_TO_SECONDS / (elapsed_ns) * 60
    print("=========================================================")
    print(f"Elapsed Nanoseconds: {elapsed_ns}")

    # Raise error if rpm exceeds limit (aka IR reading bounced back)
    if rpm > RPM_LIMIT:
        raise Exception(f"\nRPM limit of {RPM_LIMIT} exceeded: {rpm}")

    return int(rpm)

def insert_db(rpm):
    # Declare which wind tunnel table to insert into (depends on .env file)
    is_closed = os.getenv("DB_TABLE") == "closed"
    if is_closed:
        TABLE_NAME = "closed_tachometer"
    else:
        TABLE_NAME = "open_tachometer"

    # Insert reading into SQL Database
    sql_insert = psycopg2.sql.SQL("INSERT INTO {table} (rpm, status) VALUES (%s, %s)").format(
        table=psycopg2.sql.Identifier(TABLE_NAME)
    )

    if rpm > 0:
        status = 'Running'
    else:
        status = 'Off'

    print(f"Inserting rpm: {rpm} into table: {TABLE_NAME}...")
    cursor.execute(sql_insert, (rpm, status)) # execute insert command
    connection.commit() # save changes to database

# ==============================================================================
# Setup SQL connection
try:
    # Load .env file as os.getenv
    if (load_dotenv() == False):
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
# Setup IR Sensor
IR_PIN = 17
NANO_TO_SECONDS = 1000000000
RPM_LIMIT = 2500
TIMEOUT = 5

# TODO: Send error when this pin is not receiving anything
ir_sensor = DigitalInputDevice(IR_PIN, pull_up=True, bounce_time=0.005)

# ==============================================================================
# Main Loop 

INSERT_DELAY = 1      # seconds to delay inserts
last_insert_ts = 0      # last insert timestamp
last_rpm = 0

try:
    while True:
        try: 
            rpm = get_rpm() # Receive RPM from Raspberry Pi

            # accept rpm only if its not bogus
            if ((last_rpm == 0 and rpm > 500) or (rpm > 3*last_rpm and last_rpm > 0)):
                raise Exception("RPM exceeds previous measurement")

            last_rpm = rpm

            # Insert RPM value to database, only if enough time has passed
            if (time.time() - last_insert_ts) >= INSERT_DELAY:
                last_insert_ts = time.time()
                insert_db(rpm) 
                
            
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