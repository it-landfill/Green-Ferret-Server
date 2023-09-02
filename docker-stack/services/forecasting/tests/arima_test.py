# Import the custom modules to query the InfluxDB database and to build the query.
from influxdb_utils import influxdb_utils
from influxdb_utils import influxdb_query_builder

# Import the pandas library to create a DataFrame and the ARIMA model and auto ARIMA model.
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA
import pmdarima

# Import the statsmodels library to perform the Augmented Dickey-Fuller test.
from statsmodels.tsa.stattools import adfuller

#  Import the statsmodels library to perform confidence interval.
import statsmodels.stats.api as sms

# List of topics to predict
list_topic = ["humidity", "temperature", "pressure"]

# Function to query the InfluxDB database and return a DataFrame.
def query_influxdb(query_api, topic):
    # Query the InfluxDB database.
    # Example query:
    #   From the bucket named "GreenFerret", select the "airSensors" measurement about "humidity" and 
    #   mean all the value from different sensors in the same period with a 5 minutes interval.
    query = influxdb_query_builder.query_builder(topic)
    # Execute the query and return the result.
    result = influxdb_utils.send_query(query_api, query)
    raw = []
    # Iterate over the result tables and records.
    for table in result:
        for record in table.records:
            # Append the value and time of the record to the raw list.
            raw.append((record.values.get(topic), record.get_time(), record.values.get("gps_index"), record.values.get("latitude"), record.values.get("longitude")))
    # Create a DataFrame from the result.
    df=pd.DataFrame(raw, columns=['y','ds','gps_index', 'latitude', 'longitude'], index=None)
    # Convert the time column and the value column to numpy arrays.
    df['ds'] = pd.to_datetime(df['ds']).dt.tz_localize(None)
    df['y'] = df['y'].to_numpy()
    df.set_index('ds', inplace=False)
    return df

# Split the dataset into train and test sets.
def split_dataset(data, split_point = 0.99):
    # Calculate the split point.
    splitPoint = int(len(data.values) * split_point)
    # Split the dataset into train and test sets.
    train = data[:splitPoint]
    test = data[splitPoint:]
    # Reset the index of test (it is important to do this step, otherwise the index of the test will produce an error when ARIMA is fitted).
    test.reset_index(drop=True, inplace=True)
    return train, test

# Divide the dataset into train and test sets and add 24 hours to the last timestamp.
def generator_dataset_24h(data):
    # Split the dataset into train and test sets.
    train, test = split_dataset(data)
    # Add 24 hours to the last timestamp.
    lastTimestamp = data.iloc[-1].ds
    future_row = []
    for i in range(0, 23):
        future_row.append([0, lastTimestamp + pd.Timedelta(hours=i + 1), data.iloc[-1].gps_index, data.iloc[-1].latitude, data.iloc[-1].longitude])
    test = pd.concat([test, pd.DataFrame(future_row, columns=['y','ds','gps_index', 'latitude', 'longitude'])], axis=0, ignore_index=True)
    return train, test

# Fit the model by instantiating a new ARIMA object (parameters are set manually).
def fit_arima_model(train, test):
    # Create a list with the historical values.
    history = [x for x in train['y']]
    # Create a list with the predictions and the confidence interval.
    predictions = list()
    predictions_confidence = list()
    # Iterate over the test set, fit the model and make a prediction.
    for t in range(len(test)):
        model = ARIMA(history, order=(15,1,2))
        model_fit = model.fit()
        output = model_fit.forecast()
        yest = output[0]
        predictions.append(yest)
        history.append(yest)
        predictions_confidence.append(sms.DescrStatsW(predictions).tconfint_mean())    
    # Generate a dataframe with the predictions and confidence interval.
    forecast = pd.DataFrame([predictions, test['ds']], index=['yhat', 'ds']).T
    confidence_forecast = pd.DataFrame(predictions_confidence, columns=['yhat_lower', 'yhat_upper'])
    # Concatenate the two dataframes.
    forecast = pd.concat([forecast, confidence_forecast], axis=1)
    # Drop the rows with NaN values and ordinate the columns.
    forecast = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']]
    forecast = forecast.dropna();
    return forecast

# Fit the model by instantiating a new ARIMA object (parameters are set automatically).
def auto_arima_model(train, test, data):
    # Create a list with the historical values.
    history = [x for x in train['y']]
    # Fit the model and make a prediction.
    model = pmdarima.auto_arima(history, 
                            test='adf',
                            seasonal=True,
                            trace=True,             # print results when fitting the model
                            m=12,
                            error_action='ignore',  
                            suppress_warnings=True, # do not print warnings
                            stepwise=True)
    # Generate a dataframe with the predictions and confidence interval.
    forecast = pd.DataFrame([model.predict(n_periods=len(test)), test['ds']], index=['yhat', 'ds']).T
    confidence_forecast = pd.DataFrame(model.predict(n_periods=len(test), return_conf_int=True)[1], index=test.index)
    # Concatenate the two dataframes.
    forecast = pd.concat([forecast, confidence_forecast], axis=1)
    # Replace the column names and ordinate the columns.
    forecast.columns = ['yhat', 'ds', 'yhat_lower', 'yhat_upper']
    forecast = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']]
    # Drop the rows with NaN values.
    forecast = forecast.dropna()
    return forecast

# Perform the Augmented Dickey-Fuller test.
def dickey_test(data):
    # Perform the Augmented Dickey-Fuller test.
    result = adfuller(data)
    print('ADF Statistic: %f' % result[0])
    print('p-value: %f' % result[1])
    # Print the critical values.
    print('Critical Values:')
    for key, value in result[4].items():
        print('\t%s: %.3f' % (key, value))
    # Check if the time series is stationary.
    if (result[1] <= 0.05) & (result[4]['5%'] > result[0]):
        print("\u001b[32mStationary\u001b[0m")
    else:
        print("\x1b[31mNon-stationary\x1b[0m")

if __name__ == "__main__":
    write_api, query_api = influxdb_utils.setup_influxdb_client()       # Set up the InfluxDB client
    for topic in list_topic:                                            
        df = query_influxdb(query_api, topic)                           # Query the InfluxDB database
        df_split_by_lat_lon = df.groupby(['gps_index'])                 # Split the DataFrame by latitude and longitude
        for name, group in df_split_by_lat_lon:                          
            train, test = generator_dataset_24h(group)                  # Split the dataset into train and test sets and add 24 hours to the last timestamp.
            # forecast = fit_arima_model(train, test)                   # Fit the ARIMA model (parameters are set manually)
            forecast = auto_arima_model(train, test, group)             # Fit the ARIMA model (parameters are set automatically)
            lines = influxdb_utils.convert_forecast_to_list(
                forecast, 
                topic, 
                group.iloc[0].gps_index, 
                group.iloc[0].latitude, 
                group.iloc[0].longitude, 
                "arima_forecast")                                       # Convert the forecast dataframe into a list of lines
            influxdb_utils.write_forecast_to_influxdb(write_api, lines) # Write the forecast predictions to InfluxDB
    influxdb_utils.close_influxdb_client()                              # Close the InfluxDB client
