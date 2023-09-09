import requests
import json
import pandas as pd

# define file name
file_name = "../utils/gps_coordinates.txt"

# Generate a list of GPS coordinates from a file
def generate_list_gps_from_file(file_name):
    list_gps = []
    with open(file_name, 'r') as f:
        for line in f:
            # Generate latitude and longitude from line (remove space and \n)
            latitude, longitude = line.strip().split(',')
            # Convert to float and append to list
            list_gps.append([float(latitude), float(longitude)])
    return list_gps

# define start date and end date
start_date = "2023-06-01"
end_date = "2023-06-30"

# define fields to get
fields_historical_data = "temperature_2m,relativehumidity_2m,surface_pressure"
fields_air_data = "pm10,pm2_5,carbon_monoxide,european_aqi"

pandas_dataframe = pd.DataFrame(columns=['time', 'temperature', 'humidity', 'pressure', 'pm10', 'pm2_5', 'carbon_monoxide', 'european_aqi', 'gpsID'])

# Get historical data from Open Weather Map API
def get_historical_data(list_gps):
    count = 0
    # For each GPS coordinates
    for gps in list_gps:
        count += 1
        # Get latitude and longitude
        latitude, longitude = gps
        # Get air quality
        url = "https://archive-api.open-meteo.com/v1/era5?latitude={}&longitude={}&start_date={}&end_date={}&hourly={}".format(latitude, longitude, start_date, end_date, fields_historical_data)
        response = requests.get(url)
        # Save the hourly data in a pandas dataframe
        data = response.json()
        # Get the hourly data
        hourly_data = data['hourly']
        # Get the time data
        time_data = hourly_data['time']
        # Get the data
        temperature_data = hourly_data['temperature_2m']
        humidity_data = hourly_data['relativehumidity_2m']
        pressure_data = hourly_data['surface_pressure']
        # Add data to pandas dataframe (mantain data from different GPS coordinates)
        for i in range(len(time_data)):
            pandas_dataframe.loc[len(pandas_dataframe)] = [time_data[i], temperature_data[i], humidity_data[i], pressure_data[i], 0, 0, 0, 0, count]

# Get air quality from Open Weather Map API
def get_air_quality_data(list_gps):
    count = 0
    # For each GPS coordinates
    for gps in list_gps:
        count += 1
        # Get latitude and longitude
        latitude, longitude = gps
        # Get air quality
        url = "https://air-quality-api.open-meteo.com/v1/air-quality?latitude={}&longitude={}&start_date={}&end_date={}&hourly={}".format(latitude, longitude, start_date, end_date, fields_air_data)
        response = requests.get(url)
        # Save the air quality data in a pandas dataframe
        data = response.json()
        # Get the air quality data
        hourly_data = data['hourly']
        # Get the time data
        time_data = hourly_data['time']
        # Get the data
        pm10_data = hourly_data['pm10']
        pm2_5_data = hourly_data['pm2_5']
        carbon_monoxide_data = hourly_data['carbon_monoxide']
        european_aqi_data = hourly_data['european_aqi']
        # Based on the time data and count value (GPS coordinates), add data to pandas dataframe
        for i in range(len(time_data)):
            pandas_dataframe.loc[(pandas_dataframe['time'] == time_data[i]) & (pandas_dataframe['gpsID'] == count), ['pm10']] = pm10_data[i]
            pandas_dataframe.loc[(pandas_dataframe['time'] == time_data[i]) & (pandas_dataframe['gpsID'] == count), ['pm2_5']] = pm2_5_data[i]
            pandas_dataframe.loc[(pandas_dataframe['time'] == time_data[i]) & (pandas_dataframe['gpsID'] == count), ['carbon_monoxide']] = carbon_monoxide_data[i]
            pandas_dataframe.loc[(pandas_dataframe['time'] == time_data[i]) & (pandas_dataframe['gpsID'] == count), ['european_aqi']] = european_aqi_data[i]
        

if __name__ == "__main__":
    list_gps = generate_list_gps_from_file(file_name)
    get_historical_data(list_gps)
    get_air_quality_data(list_gps)
    # Save pandas dataframe to csv file
    pandas_dataframe.to_csv('../utils/historical_data.csv', index=False)
