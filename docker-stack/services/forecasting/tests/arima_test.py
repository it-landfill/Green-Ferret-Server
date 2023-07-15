# Import the custom modules to query the InfluxDB database and to build the query.
from influxdb_utils import influxdb_utils
from influxdb_utils import influxdb_query_builder

# Import the pandas library to create a DataFrame and the ARIMA model.
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA
import statsmodels.stats.api as sms

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
            # Append the value and time of the record to the raw list.
            raw.append((record.get_value(), record.get_time()))
    # Create a DataFrame from the result.
    df=pd.DataFrame(raw, columns=['y','ds'], index=None)
    print(df)
    # Convert the time column and the value column to numpy arrays.
    df['ds'] = pd.to_datetime(df['ds']).dt.tz_localize(None)
    df['y'] = df['y'].to_numpy()
    df.set_index('ds', inplace=False)
    return df

def split_dataset(data, split_point = 0.80):
    # Split the dataset into train and test sets.
    splitPoint = int(len(data.values) * split_point)
    train = df[:splitPoint]
    test = df[splitPoint:]
    # Reset the index of test (it is important to do this step, otherwise 
    # the index of the test will produce an error when ARIMA is fitted).
    test.reset_index(drop=True, inplace=True)
    return train, test

# Fit the model by instantiating a new ARIMA object and calling the fit() method.
def fit_arima_model(train, test):
    history = [x for x in train['y']]
    predictions = list()
    predictions_confidence = list()
        
    for t in range(len(test)):
        # TODO: Evaluate where to put the fit method (inside the loop or outside).
        # TODO: Evaluate different sets of parameters.
        model = ARIMA(history, order=(1,1,1))
        model_fit = model.fit()
        output = model_fit.forecast()
        yest = output[0]
        predictions.append(yest)
        obs = test['y'][t]
        history.append(obs)
        predictions_confidence.append(sms.DescrStatsW(predictions).tconfint_mean())
        print('predicted=%f, expected=%f' % (yest, obs))
    # Generate a dataframe with the predictions as "yhat" and the time as "ds".
    forecast = pd.DataFrame([predictions, test['ds']], index=['yhat', 'ds']).T
    confidence_forecast = pd.DataFrame(predictions_confidence, columns=['yhat_lower', 'yhat_upper'])
    forecast = pd.concat([forecast, confidence_forecast], axis=1)
    # Order the columns of the dataframe.
    forecast = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']]
    return forecast

if __name__ == "__main__":
    write_api, query_api = influxdb_utils.setup_influxdb_client()   # Set up the InfluxDB client
    df = query_influxdb(query_api)                                  # Query the InfluxDB database
    train, test = split_dataset(df)                                 # Split the dataset into train and test sets
    forecast = fit_arima_model(train, test)                         # Fit the Arima model and make predictions
    lines = influxdb_utils.convert_forecast_to_list(forecast)       # Convert the forecast dataframe into a list of lines
    # influxdb_utils.write_forecast_to_influxdb(write_api, lines)   # Write the forecast predictions to InfluxDB
    influxdb_utils.close_influxdb_client()                          # Close the InfluxDB client
