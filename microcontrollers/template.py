# template.py
# use this file as a template for building a new sensor

import psycopg2                 # PostgreSQL
from psycopg2 import sql        # PostgreSQL
import time                     # sleep
import sys                      # exit early
import os                       # .env
from dotenv import load_dotenv  # .env
# add more imports here

# ==============================================================================
# Helper Functions

# TODO: finish this function
def gather_data():
    return 0

def insert_db():
    data = gather_data()

    # Declare which wind tunnel table to insert into (depends on .env file)
    is_closed = os.getenv("DB_TABLE") == "closed"
    # TODO: Edit table names to reflect database
    if is_closed:
        TABLE_NAME = "closed_example"
    else:
        TABLE_NAME = "open_example"

    # TODO: replace example_column  with actual column name
    # Insert data into database
    sql_insert = psycopg2.sql.SQL("INSERT INTO {table} (example_column) VALUES (%s)").format(
        table=psycopg2.sql.Identifier(TABLE_NAME)
    )

    # TODO: replace data if you renamed the variable
    print(f"Inserting data: {data} readings into table: {TABLE_NAME}...")
    cursor.execute(sql_insert, (data,)) # execute insert command
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
# TODO: add your microcontroller code


# ==============================================================================
# Main Loop
try:
    while True:
        try:
            insert_db()
            time.sleep(1)
        except Exception as error:
            print("Error while reading from sensor or inserting to database: ", error)
            connection.rollback()
            time.sleep(1) # wait before retrying so a failed read doesn't spin and flood the I2C bus

except KeyboardInterrupt:
    print("Stopped by user")

# Close out all connections
finally:
    if cursor:
        cursor.close()
    if connection:
        connection.close()
        print("PostgreSQL connection closed")


