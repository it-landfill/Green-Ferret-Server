from influxdb_client import InfluxDBClient, Point, WriteOptions
from influxdb_client.client.write_api import SYNCHRONOUS
import time
import os


token = os.environ.get("FORECASTING_INFLUXDB_TOKEN", "")
if token == "":
	print("FORECASTING_INFLUXDB_TOKEN not set, exiting...")
	exit(1)
	
bucket = "Green-Ferret"
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
def convert_forecast_to_list(forecast, topic, name, latitude, longitude, measurement):
    forecast['measurement'] = measurement
    cp = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper', 'measurement']].copy() 
    # Create a list of lines in Line Protocol format.
    lines = []
    # If measurement is "arima_forecast", then the lines will be in the format:
    if measurement == "arima_forecast":
        lines = [f"{measurement},sensorId={name} latitude={latitude},longitude={longitude},{topic}_hat={row['yhat']},{topic}_hat_lower={row['yhat_lower']},{topic}_hat_upper={row['yhat_upper']} {int(time.mktime(row['ds'].timetuple()))}000000000" for index, row in cp.iterrows()]
    else:
        lines = [str(cp["measurement"][d]) + ","
            + "sensorId=" + str(name) + " "
            + "latitude=" + str(latitude) + ","
            + "longitude=" + str(longitude) + ","
            +  str(topic) + "_hat=" + str(cp["yhat"][d]) + ","
            +  str(topic) + "_hat_lower=" + str(cp["yhat_lower"][d]) + ","
            +  str(topic) + "_hat_upper=" + str(cp["yhat_upper"][d])
            + " " + str(int(time.mktime(cp['ds'][d].timetuple()))) + "000000000" for d in range(len(cp))]
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