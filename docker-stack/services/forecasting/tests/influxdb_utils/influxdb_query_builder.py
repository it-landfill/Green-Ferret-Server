# Return a query string for InfluxDB
def query_builder():
    return 'from(bucket: "GreenFerret")' \
            '|> range(start:2023-07-13T00:00:00Z, stop:2023-07-13T19:00:00Z)' \
            '|> filter(fn: (r) => r["_measurement"] == "airSensors")' \
            '|> filter(fn: (r) => r["_field"] == "humidity")' \
            '|> drop(columns: ["sensor_id"])' \
            '|> aggregateWindow(every: 5m, fn: mean, createEmpty: false)' \
            '|> yield(name: "mean")'