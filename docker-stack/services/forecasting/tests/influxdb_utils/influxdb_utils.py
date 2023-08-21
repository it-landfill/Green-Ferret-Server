from influxdb_client import InfluxDBClient, Point, WriteOptions
from influxdb_client.client.write_api import SYNCHRONOUS
import time
import os


token = os.environ.get("FORECASTING_INFLUXDB_TOKEN", "")
if token == "":
	print("FORECASTING_INFLUXDB_TOKEN not set, exiting...")
	exit(1)

bucket = "Green-Ferret-OpenMeteo"
org = "IT-Landfill"
client = InfluxDBClient(url="http://pi3aleben:8086", token=token, org=org)

# Function to set up the InfluxDB client and return the write and query APIs.
def setup_influxdb_client():
    query_api = client.query_api()
    write_api = client.write_api(write_options=SYNCHRONOUS)
    return write_api, query_api

def send_query(query_api, query):
    return client.query_api().query(org=org, query=query)
     
# Function to convert the forecast Dataframe to Line Protocol, which is the format used by InfluxDB.
# <measurement>[,<tag_key>=<tag_value>[,<tag_key>=<tag_value>]] <field_key>=<field_value>[,<field_key>=<field_value>] [<timestamp>]
def convert_forecast_to_list(forecast, name, i):
    forecast['measurement'] = "prophet_forecast"
    forecast['latitude'] = name[0]
    forecast['longitude'] = name[1]
    cp = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper', 'latitude', 'longitude', 'measurement']].copy()
    lines = [str(cp["measurement"][d]) + ","
         + "sensorID=" + str(i) + " "
         + "latitude=" + str(cp["latitude"][d]) + ","
         + "longitude=" + str(cp["longitude"][d]) + ","
         + "yhat=" + str(cp["yhat"][d]) + ","
         + "yhat_lower=" + str(cp["yhat_lower"][d]) + ","
         + "yhat_upper=" + str(cp["yhat_upper"][d])
         + " " + str(int(time.mktime(cp['ds'][d].timetuple()))) + "000000000" for d in range(len(cp))
    ]
    return lines

# Function to write the forecast to InfluxDB.
def write_forecast_to_influxdb(write_api, lines):
    # The default instance of WriteApi uses batching and writes to the InfluxDB 
    # server only when the buffer is full.
    # It is possible to change this behavior by setting the write_options parameter 
    # of the WriteApi constructor.
    #
    # write_api = client.write_api(
    #       write_options = WriteOptions(
    #           batch_size = 10, 
    #           flush_interval = 10_000, 
    #           jitter_interval = 2_000, 
    #           retry_interval = 5_000
    #       )
    # )
    write_api.write(bucket, org, lines)

# Function to close the InfluxDB client.
def close_influxdb_client():
    client.close()