import { FluxTableMetaData, InfluxDB } from "@influxdata/influxdb-client";

import {
  ForcastingTypeModel,
  targetForcastingModel,
  typeForcastingModel,
} from "../utils/ForcastingTypeModel";

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

  export type ForecastingMeasurement = {
    time: Date;
    hatValue: number;
    lowerValue: number;
    upperValue: number;
  };

  /**
   * Get InfluxDB client (singleton)
   * @param url InfuxDB URL
   * @param token InfluxDB token (default: process.env.INFLUXDB_TOKEN)
   * @returns InfluxDB client
   */
  function getClient(
    url: string | undefined = undefined,
    token: string | undefined = undefined
  ): InfluxDB {
    if (_client === undefined) {
      _client = new InfluxDB({
        url: url || process.env.REACT_APP_INFLUXDB_URL || "http://pi3aleben:8086",
        token: token || process.env.REACT_APP_INFLUXDB_TOKEN,
      });
    }
	console.log(_client);
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
      "http://pi3aleben:8086");

    let queryClient = client.getQueryApi("IT-Landfill");

    let fluxQuery = `
		import "influxdata/influxdb/schema"

		from(bucket: "Green-Ferret")
			|> range(start: ${Math.trunc(start.getTime() / 1000)}, stop: ${Math.trunc(
      end.getTime() / 1000
    )})
			|> filter(fn: (r) => r["_measurement"] == "openMeteoData")
			|> drop(columns: ["_start", "_stop"])  
			|> filter(fn: (r) => r["_field"] == "humidity" or r["_field"] == "pressure" or r["_field"] == "temperature" or r["_field"] == "latitude" or r["_field"] == "longitude")   
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
          reject(error);
        },
        complete: () => {
          resolve(result);
        },
      });
    });

    return prom;
  }

  export async function getForcastingData(
    dataPoints: Measurement[][],
    forcastingInfomations: ForcastingTypeModel
  ): Promise<ForecastingMeasurement[]> {
    const client = getClient(
      "http://pi3aleben:8086"
    );

    let queryClient = client.getQueryApi("IT-Landfill");

    // Set timeRangeStart and timeRangeStop to get last time from dataPoints and add 24 hour
    let timeRangeStart = dataPoints[dataPoints.length - 1][0].time;
    console.log("Data start: ",dataPoints[dataPoints.length - 1][0]);
    let timeRangeStop = new Date(
      timeRangeStart.getTime() + 24 * 60 * 60 * 1000
    );

    let type: String = "none";
    // Get only the type with the true value
    // Get the value associated to the key
    for (const key in forcastingInfomations.type)
      if (forcastingInfomations.type[key as keyof typeForcastingModel])
        type = (key as keyof typeForcastingModel).toString().toLowerCase();
    

    let target: keyof targetForcastingModel = "none";
    // Get only the target with the true value
    // Get the value associated to the key
    for (const key in forcastingInfomations.target)
      if (forcastingInfomations.target[key as keyof targetForcastingModel])
        target = key as keyof targetForcastingModel;
    
    let fluxQueryGraph = `
    from(bucket: "Green-Ferret")
      |> range(start:  ${Math.trunc(
        timeRangeStart.getTime() / 1000
      )}, stop: ${Math.trunc(timeRangeStop.getTime() / 1000)})
      |> filter(fn: (r) => r["_measurement"] == "${type}_forecast")
      |> drop(columns: ["_start", "_stop", "sensorId"])  
      |> filter(fn: (r) => r["_field"] == "${target}_hat" or r["_field"] == "${target}_hat_lower" or r["_field"] == "${target}_hat_upper")
      |> group(columns: ["_time", "_field"], mode:"by")
      |> mean(column: "_value") 
      |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
    `;

    console.log(fluxQueryGraph);
    let result: ForecastingMeasurement[] = [];

    let prom = new Promise<ForecastingMeasurement[]>((resolve, reject) => {
      queryClient.queryRows(fluxQueryGraph, {
        next: (row: string[], tableMeta: FluxTableMetaData) => {
          // For each row, create a ForecastingMeasurement object and add it to the result array
          const tableObject = tableMeta.toObject(row);
          const tmp: ForecastingMeasurement = {
            time: new Date(tableObject._time),
            // Compone the name of the field with the target and "_hat"
            hatValue: tableObject[`${target}_hat`],
            lowerValue: tableObject[`${target}_hat_lower`],
            upperValue: tableObject[`${target}_hat_upper`],
          };
          result.push(tmp);
        },
        error: (error: Error) => {
          reject(error);
        },
        complete: () => {
          resolve(result);
        },
      });
    });

    return prom;
  }
}
