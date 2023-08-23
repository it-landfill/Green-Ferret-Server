# Import the custom modules to query the InfluxDB database and to build the query.
from influxdb_utils import influxdb_utils
from influxdb_utils import influxdb_query_builder

# Import the pandas library to create a DataFrame and the ARIMA model.
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA
import statsmodels.stats.api as sms

# Import the adfuller function to perform the Augmented Dickey-Fuller test.
from statsmodels.tsa.stattools import adfuller

# Import ACF and PACF plots.
from statsmodels.graphics.tsaplots import plot_acf, plot_pacf

# Import the pmdarima library to perform the auto_arima model.
import pmdarima

# List of topics to predict
list_topic = ["humidity", "temperature", "pressure"]

# Function to query the InfluxDB database and return a DataFrame.
def query_influxdb(query_api, topic):
    # Query the InfluxDB database.
    # Example query:
    #   From the bucket named "GreenFerret", select the "airSensors" measurement about "humidity" and 
    #   mean all the value from different sensors in the same period with a 5 minutes interval.
    query = influxdb_query_builder.query_builder(topic)
    print(query)
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

def split_dataset(data, split_point = 0.80):
    # Split the dataset into train and test sets.
    splitPoint = int(len(data.values) * split_point)
    train = data[:splitPoint]
    test = data[splitPoint:]
    # Reset the index of test (it is important to do this step, otherwise 
    # the index of the test will produce an error when ARIMA is fitted).
    test.reset_index(drop=True, inplace=True)
    return train, test

def generator_dataset_24h(data):
    # Split the dataset into train and test sets.
    train, test = split_dataset(data)
    # add 24 hours to the last timestamp
    lastTimestamp = data.iloc[-1].ds
    ginopippo = []
    for i in range(0, 23):
        ginopippo.append([0, lastTimestamp + pd.Timedelta(hours=i + 1), data.iloc[-1].gps_index, data.iloc[-1].latitude, data.iloc[-1].longitude])
    test = pd.concat([test, pd.DataFrame(ginopippo, columns=['y','ds','gps_index', 'latitude', 'longitude'])], axis=0, ignore_index=True)
    return train, test

# Fit the model by instantiating a new ARIMA object and calling the fit() method.
def fit_arima_model(train, test):
    history = [x for x in train['y']]
    predictions = list()
    predictions_confidence = list()

    for t in range(len(test)):
        model = ARIMA(history, order=(15,1,2))
        model_fit = model.fit()
        output = model_fit.forecast()
        yest = output[0]
        predictions.append(yest)
        history.append(yest)
        predictions_confidence.append(sms.DescrStatsW(predictions).tconfint_mean())    
    # Generate a dataframe with the predictions as "yhat" and the time as "ds".
    forecast = pd.DataFrame([predictions, test['ds']], index=['yhat', 'ds']).T
    confidence_forecast = pd.DataFrame(predictions_confidence, columns=['yhat_lower', 'yhat_upper'])
    forecast = pd.concat([forecast, confidence_forecast], axis=1)
    # Order the columns of the dataframe.
    forecast = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']]
    # Drop the rows with NaN values.
    forecast = forecast.dropna()
    return forecast

def auto_arima_model(train, test, data):
    history = [x for x in train['y']]
    # Fit the model by instantiating a new ARIMA object and calling the fit() method.
    model = pmdarima.auto_arima(history, 
                            start_p=1, start_q=1,   # initial p and q
                            max_p=15, max_q=15,     # maximum p and q
                            start_P=0,              # initial P
                            D=0,                    # initial D
                            trace=True,             # print results when fitting the model
                            suppress_warnings=True, # do not print warnings
                            stepwise=True)
    # Generate a dataframe with the predictions as "yhat" and the time as "ds".
    forecast = pd.DataFrame([model.predict(n_periods=len(test)), test['ds']], index=['yhat', 'ds']).T
    # forecast = pd.DataFrame(model.predict(n_periods=len(test)), index=test.index)
    confidence_forecast = pd.DataFrame(model.predict(n_periods=len(test), return_conf_int=True)[1], index=test.index)
    forecast = pd.concat([forecast, confidence_forecast], axis=1)
    # Replace the column names.
    forecast.columns = ['yhat', 'ds', 'yhat_lower', 'yhat_upper']
    forecast = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']]
    # Drop the rows with NaN values.
    forecast = forecast.dropna()
    return forecast

def dickey_test(data):
    # Perform the Augmented Dickey-Fuller test.
    result = adfuller(data)
    # Print the test statistic.
    print('ADF Statistic: %f' % result[0])
    # Print the p-value.
    print('p-value: %f' % result[1])
    # Print the critical values.
    print('Critical Values:')
    for key, value in result[4].items():
        print('\t%s: %.3f' % (key, value))
    if (result[1] <= 0.05) & (result[4]['5%'] > result[0]):
        print("\u001b[32mStationary\u001b[0m")
    else:
        print("\x1b[31mNon-stationary\x1b[0m")

if __name__ == "__main__":
    write_api, query_api = influxdb_utils.setup_influxdb_client()   # Set up the InfluxDB client
    for topic in list_topic:                                            
        df = query_influxdb(query_api, topic)
        dickey_test(df['y'])
        df_split_by_lat_lon = df.groupby(['gps_index'])
        for name, group in df_split_by_lat_lon:                          # Query the InfluxDB database
            print("Processing sensor: " + str(group.iloc[0].gps_index))
            print(group)
            train, test = generator_dataset_24h(group)                                 # Split the dataset into train and test sets
            # forecast = fit_arima_model(train, test) 
            # print(forecast)
            forecast = auto_arima_model(train, test, group)
            lines = influxdb_utils.convert_forecast_to_list(forecast, topic, group.iloc[0].gps_index, group.iloc[0].latitude, group.iloc[0].longitude, "arima_forecast") # Convert the forecast dataframe into a list of lines
            influxdb_utils.write_forecast_to_influxdb(write_api, lines) # Write the forecast predictions to InfluxDB
            # Exit the loop after the first iteration (for testing purposes).
            break
    influxdb_utils.close_influxdb_client()                          # Close the InfluxDB client
