# Data scheme

## Available data

- board id
- latitude
- longitude
- temperature
- humidity
- pressure
- air quality
  - aqi
  - tvoc
  - eco2

### mqtt json label conversion

- lat -> latitude
- lon -> longitude
- tem -> temperature
- hum -> humidity
- pre -> pressure
- aqi -> air_quality_index
- tvo -> tvoc
- eco -> eco2

# Drop data

influx delete --bucket Green-Ferret --start '1970-01-01T00:00:00Z' --stop '2023-12-10T00:00:00Z' --predicate 'source="http-agent"'
