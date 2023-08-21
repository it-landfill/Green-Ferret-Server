# Import the custom modules to query the InfluxDB database and to build the query.
from influxdb_utils import influxdb_utils
from influxdb_utils import influxdb_query_builder

# Import the pandas library to create a DataFrame and the Prophet model.
import pandas as pd
from prophet import Prophet

# Function to query the InfluxDB database and return a DataFrame.
def query_influxdb(query_api):
    # Query the InfluxDB database.
    # Example query:
    #   From the bucket named "GreenFerret", select the "airSensors" measurement about "humidity" and 
    #   mean all the value from different sensors in the same period with a 5 minutes interval.
    query = influxdb_query_builder.query_builder()
    # Execute the query and return the result.
    result = influxdb_utils.send_query(query_api, query)
    raw = []
    # Iterate over the result tables and records.
    for table in result:
        for record in table.records:
            print(record.values.get("latitude"))
            # Append the value and time of the record to the raw list.
            raw.append((record.get_value(), record.get_time(), record.values.get("latitude"), record.values.get("longitude")))
    # Create a DataFrame from the result.
    df=pd.DataFrame(raw, columns=['y','ds', 'lat', 'lon'], index=None)
    # Convert the time column to datetime64[ns] and the value column to float.
    df['ds'] = df['ds'].values.astype('datetime64[ns]')
    df['y'] = df['y'].values.astype('float')
    df['lat'] = df['lat'].values.astype('float')
    df['lon'] = df['lon'].values.astype('float')
    df.set_index('ds')
    return df

# Fit the model by instantiating a new Prophet object and passing in the historical DataFrame.
def fit_prophet_model(df):
    m = Prophet(interval_width=0.95)
    # If there's some type of error, see: https://github.com/facebook/prophet/issues/1568#issuecomment-660328884
    m.fit(df)
    future = m.make_future_dataframe(periods=24, freq='H')
    forecast = m.predict(future)
    return forecast

if __name__ == "__main__":
    write_api, query_api = influxdb_utils.setup_influxdb_client()   # Set up the InfluxDB client
    df = query_influxdb(query_api)                                  # Query the InfluxDB database
    df_split_by_lat_lon = df.groupby(['lat', 'lon'])                # Split the DataFrame by latitude and longitude
    i = 0
    for name, group in df_split_by_lat_lon:
        print(name)
        print(group)
        forecast = fit_prophet_model(group)                         # Fit the Prophet model
        lines = influxdb_utils.convert_forecast_to_list(forecast, name, i) # Convert the forecast dataframe into a list of lines
        i+=1
        influxdb_utils.write_forecast_to_influxdb(write_api, lines) # Write the forecast predictions to InfluxDB
    # forecast = fit_prophet_model(df)                                # Fit the Prophet model
    # lines = influxdb_utils.convert_forecast_to_list(forecast)       # Convert the forecast dataframe into a list of lines
    # influxdb_utils.write_forecast_to_influxdb(write_api, lines)   # Write the forecast predictions to InfluxDB
    influxdb_utils.close_influxdb_client()                          # Close the InfluxDB client
