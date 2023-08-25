import { FluxTableMetaData, InfluxDB } from "@influxdata/influxdb-client";

/**
 * InfluxDB access
 *
 * Environment variables:
 * - REACT_APP_INFLUXDB_TOKEN: InfluxDB token
 */

export module InfluxAccess {
  let _client: InfluxDB | undefined = undefined;

  /**
   * Measurement object
   * @property latitude Measurement latitude
   * @property longitude Measurement longitude
   * @property time Measurement time
   * @property temperature Measurement temperature
   * @property pressure Measurement pressure
   * @property humidity Measurement humidity
   * @property eco2 Measurement Equivalent CO2
   * @property tvoc Measurement Total Volatile Organic Compounds
   * @property aqi Measurement Air Quality Index
   */
  export type Measurement = {
    latitude: number;
    longitude: number;
    time: Date;
    temperature: number;
    pressure: number;
    humidity: number;
    eco2: number;
    tvoc: number;
    aqi: number;
  };

  /**
   * Get InfluxDB client (singleton)
   * @param url InfuxDB URL
   * @param token InfluxDB token (default: process.env.INFLUXDB_TOKEN)
   * @returns InfluxDB client
   */
  function getClient(
    url: string,
    token: string | undefined = undefined
  ): InfluxDB {
    if (_client === undefined) {
      _client = new InfluxDB({
        url,
        token: token || process.env.REACT_APP_INFLUXDB_TOKEN,
      });
    }
    return _client;
  }

  /**
   * Get data from InfluxDB
   * @param start Start date (inclusive)
   * @param end End date (exclusive)
   * @returns Promise with array of measurements
   */
  export async function getData(
    start: Date,
    end: Date
  ): Promise<Measurement[]> {
    const client = getClient(
      "http://pi3aleben:8086"
    );

    let queryClient = client.getQueryApi("IT-Landfill");
    // let fluxQuery = `
    // import "influxdata/influxdb/schema"

    // from(bucket: "Green-Ferret")
    // 	|> range(start: ${Math.trunc(start.getTime()/1000)}, stop: ${Math.trunc(end.getTime()/1000)})
    // 	|> filter(fn: (r) =>
    // 		r._measurement == "mobile-sensors" and
    // 		(r._field == "latitude" or r._field == "longitude" or r["_field"] == "air_quality_index" or r["_field"] == "equivalent_co2" or r["_field"] == "humidity" or r["_field"] == "pressure" or r["_field"] == "temperature" or r["_field"] == "total_volatile_organic_compounds")
    // 	)
    // 	|> schema.fieldsAsCols()
    // 	|> group()
    // 	|> sort(columns: ["_time"])
    // `;
    let fluxQuery = `
		import "influxdata/influxdb/schema"

		from(bucket: "Green-Ferret")
			|> range(start: ${Math.trunc(start.getTime() / 1000)}, stop: ${Math.trunc(
      end.getTime() / 1000
    )})
			|> filter(fn: (r) => r["_measurement"] == "openMeteoData")
			|> drop(columns: ["_start", "_stop"])  
			|> filter(fn: (r) => r["_field"] == "humidity" or r["_field"] == "latitude" or r["_field"] == "longitude")   
			|> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
		`;

    let result: Measurement[] = [];

    let prom = new Promise<Measurement[]>((resolve, reject) => {
      queryClient.queryRows(fluxQuery, {
        next: (row: string[], tableMeta: FluxTableMetaData) => {
          // For each row, create a Measurement object and add it to the result array
            const tableObject = tableMeta.toObject(row);

            const tmp: Measurement = {
              latitude: tableObject.latitude,
              longitude: tableObject.longitude,
              time: new Date(tableObject._time),
              temperature: tableObject.temperature,
              pressure: tableObject.pressure,
              humidity: tableObject.humidity,
              eco2: tableObject.equivalent_co2,
              tvoc: tableObject.total_volatile_organic_compounds,
              aqi: tableObject.air_quality_index,
            };

            result.push(tmp);
        },
        error: (error: Error) => {
          console.error("\nError", error);
          reject(error);
        },
        complete: () => {
          console.log("\nSuccess");
          resolve(result);
        },
      });
    });

    return prom;
  }
}
