import influxdb_client
from influxdb_client.client.write_api import SYNCHRONOUS
import pandas as pd

# Definition of the connection parameters
bucket = "Test"
org = "ITLandfill"
token = "f5kH6ybaAxrhxNIADq-Vh3ZCxDFdqu_kRCQ9vVlVeLLL2WNerkNu49zcDIatBjeSBMARWN6eLHp9Xfm5zDJwpQ=="
# Store the URL of your InfluxDB instance
url="http://localhost:8086"

# Create a connection to InfluxDB
client = influxdb_client.InfluxDBClient(url=url, token=token, org=org)

# Create a write API instance
write_api = client.write_api(write_options=SYNCHRONOUS)

if __name__ == "__main__":
    # Read the CSV file
    df = pd.read_csv("utils/historical_data.csv")
    # Get GPS coordinates from the txt file
    gps_coordinates = []
    with open("utils/gps_coordinates.txt", "r") as f:
        for line in f:
            # Split the line, cast to float and append to the list
            latitude, longitude = line.strip().split(',')
            gps_coordinates.append([float(latitude), float(longitude)])

    # Make GPS coordinates a pandas dataframe
    df_gps = pd.DataFrame(gps_coordinates, columns=['latitude', 'longitude'])
    # Change the index of the dataframe to start from 1
    df_gps.index += 1
    # Join the two dataframes on gpsCoordinates
    df = df.join(df_gps, on='gpsID')
    # Drop the gpsID column
    df = df.drop(columns=['gpsID'])
    # Convert the dataframe to a list of dictionaries
    data = df.to_dict('records')
    data_record = []
    for d in data:
        point = influxdb_client.Point("openMeteoData").tag("latitude", d['latitude']).tag("longitude", d['longitude']).field("temperature", d['temperature']).field("humidity", d['humidity']).field("pressure", d['pressure']).time(d['time'])
        # Write the data to InfluxDB
        write_api.write(bucket=bucket, record=point)
    # Close the connection
    client.close()
