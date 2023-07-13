from prophet import Prophet
import pandas as pd
from influxdb_client import InfluxDBClient, Point, WriteOptions
from influxdb_client.client.write_api import SYNCHRONOUS
import time
from datetime import datetime

token = "zQ0CgptaJgXzlNlRqCgtv89hcGEtDSf6B3BHM_E8vYhqnhOZJgYCCOSA8inN4tyh__4TnEHG3ERyHK7fTMl4jw=="
bucket = "TestBucket"
org = "TestOrganization"
client = InfluxDBClient(url="http://localhost:8086", token=token, org=org)

# Function to set up the InfluxDB client
def setup_influxdb_client():
    query_api = client.query_api()
    write_api = client.write_api(write_options=SYNCHRONOUS)
    return write_api, query_api

# Function to query the InfluxDB database
def query_influxdb(query_api):
    query = 'from(bucket: "TestBucket")' \
        '|> range(start:2023-06-30T00:00:00Z, stop:2023-06-30T19:00:00Z)'\
        '|> filter(fn: (r) => r["_measurement"] == "airSensors")' \
        '|> filter(fn: (r) => r["_field"] == "humidity")' \
        '|> filter(fn: (r) => r["sensor_id"] == "TLM0100")'
    result = client.query_api().query(org=org, query=query)
    raw = []
    for table in result:
        for record in table.records:
            raw.append((record.get_value(), record.get_time()))
    df=pd.DataFrame(raw, columns=['y','ds'], index=None)
    df['ds'] = df['ds'].values.astype('datetime64[ns]')
    df['y'] = df['y'].values.astype('float')
    df.set_index('ds')

    return df

# Fit the model by instantiating a new Prophet object and passing in the historical DataFrame.
def fit_prophet_model(df):
    # Print the first 5 rows of the DataFrame.
    print(df.head())
    m = Prophet(interval_width=0.95)
    # If there's some type of error, see: https://github.com/facebook/prophet/issues/1568#issuecomment-660328884
    m.fit(df)
    future = m.make_future_dataframe(periods=24, freq='H')
    forecast = m.predict(future)
    forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail()
    print(forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail())
    return forecast

# Function to convert the forecast Dataframe to Line Protocol.
def convert_forecast_to_list(forecast):
    forecast['measurement'] = "views"
    cp = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper','measurement']].copy()
    lines = [str(cp["measurement"][d]) 
         + ",type=forecast" 
         + " " 
         + "yhat=" + str(cp["yhat"][d]) + ","
         + "yhat_lower=" + str(cp["yhat_lower"][d]) + ","
         + "yhat_upper=" + str(cp["yhat_upper"][d])
         + " " + str(int(time.mktime(cp['ds'][d].timetuple()))) + "000000000" for d in range(len(cp))
    ]
    print(lines)
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
def close_influxdb_client(client):
    client.close()

if __name__ == "__main__":
    # Set up the InfluxDB client
    write_api, query_api = setup_influxdb_client()
    # Query the InfluxDB database
    df = query_influxdb(query_api)
    # Fit the Prophet model
    forecast = fit_prophet_model(df)
    # Convert the forecast dataframe into a list of tuples
    lines = convert_forecast_to_list(forecast)
    # Write the forecast to InfluxDB
    write_forecast_to_influxdb(write_api, lines)
    # Close the InfluxDB client
    close_influxdb_client(client)
