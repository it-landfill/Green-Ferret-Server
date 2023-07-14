import statsmodels.api as sm
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.stattools import adfuller
from statsmodels.graphics import tsaplots
import pandas as pd
from influxdb_client import InfluxDBClient, Point, WriteOptions
from influxdb_client.client.write_api import SYNCHRONOUS
import time
from datetime import datetime

token = "mGXC9hh6IQXuFn6xvF41OZWesNIvfMFhVkJEm2fRXMzaDE7V56qUUS2obpmFLgI2QAkQOxHz02h0_D-y4VxqIQ=="
bucket = "GreenFerret"
org = "ITLandfill"
client = InfluxDBClient(url="http://localhost:8086", token=token, org=org)

# Function to set up the InfluxDB client and return the write and query APIs.
def setup_influxdb_client():
    query_api = client.query_api()
    write_api = client.write_api(write_options=SYNCHRONOUS)
    return write_api, query_api

# Function to query the InfluxDB database and return a DataFrame.
def query_influxdb(query_api):
    # Query the InfluxDB database.
    # Example query:
    #   From the bucket named "GreenFerret", select the "airSensors" measurement about "humidity" and 
    #   mean all the value from different sensors in the same period with a 5 minutes interval.
    query = 'from(bucket: "GreenFerret")' \
            '|> range(start:2023-07-13T00:00:00Z, stop:2023-07-13T19:00:00Z)' \
            '|> filter(fn: (r) => r["_measurement"] == "airSensors")' \
            '|> filter(fn: (r) => r["_field"] == "humidity")' \
            '|> drop(columns: ["sensor_id"])' \
            '|> aggregateWindow(every: 5m, fn: mean, createEmpty: false)' \
            '|> yield(name: "mean")'
    # Execute the query and return the result.
    result = client.query_api().query(org=org, query=query)
    raw = []
    # Iterate over the result tables and records.
    for table in result:
        for record in table.records:
            # Append the value and time of the record to the raw list.
            raw.append((record.get_value(), record.get_time()))
    # Create a DataFrame from the result.
    df=pd.DataFrame(raw, columns=['y','ds'], index=None)
    print(df)
    # Convert the time column and the value column to numpy arrays.
    df['ds'] = pd.to_datetime(df['ds']).dt.tz_localize(None)
    df['y'] = df['y'].to_numpy()
    df.set_index('ds', inplace=False)
    ##########
    nrows = (len(df.values))
    print(nrows)
    splitPoint = int(nrows * 0.80)
    print(splitPoint)
    train = df['y'][:splitPoint]
    test = df['y'][splitPoint:]
    print(train)
    print(test)
    # Reset the index of test 
    test.reset_index(drop=True, inplace=True)
    print(test)
    ###########
    result = adfuller(train)
    print('ADF Statistic: %f' % result[0])
    print('p-value: %f' % result[1])
    #Step 4: Find the differencing parameter (d)

    trainNew = train.diff().dropna()

    result = adfuller(trainNew)
    print('ADF Statistic: %f' % result[0])
    print('p-value: %f' % result[1])

    #######

    history = [x for x in train]
    predictions = list()
        
    for t in range(len(test)):
        model = ARIMA(history, order=(1,1,1))
        model_fit = model.fit()
        output = model_fit.forecast()
        yest = output[0]
        predictions.append(yest)
        obs = test[t] 
        history.append(obs)
        print('predicted=%f, expected=%f' % (yest, obs))

    return df

# Fit the model by instantiating a new Prophet object and passing in the historical DataFrame.
def fit_prophet_model(df):
    model = sm.tsa.arima.ARIMA(df, order=(1,0,2))
    # If there's some type of error, see: https://github.com/facebook/prophet/issues/1568#issuecomment-660328884
    result = model.fit()
    forecast = result.get_forecast(steps=10)
    print(forecast)
    return forecast

# Function to convert the forecast Dataframe to Line Protocol, which is the format used by InfluxDB.
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
    # forecast = fit_prophet_model(df)
    # Convert the forecast dataframe into a list of tuples
    # lines = convert_forecast_to_list(forecast)
    # Write the forecast to InfluxDB
    # write_forecast_to_influxdb(write_api, lines)
    # Close the InfluxDB client
    close_influxdb_client(client)
