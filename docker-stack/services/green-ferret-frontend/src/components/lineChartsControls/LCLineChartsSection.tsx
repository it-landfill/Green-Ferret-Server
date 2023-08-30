import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import LineMultiGraph from "./LCLineChartsComponents/LCLineMultiGraph";
import LineMonoGraph from "./LCLineChartsComponents/LCLineMonoGraph";
import LineControls from "./LCLineChartsComponents/LCLineControls";

import { InfluxAccess } from "../../utils/InfluxAccess";

import { LineChartModel } from "../../utils/LineChartModel";

interface LineChartsSectionProps {
  dataPoints: InfluxAccess.Measurement[][];
}

const defaultLCModel: LineChartModel = {
  temperature: {
    checked: true,
    exists: false,
    color: "#8884d8",
  },
  humidity: {
    checked: true,
    exists: false,
    color: "#CA829D",
  },
  pressure: {
    checked: true,
    exists: false,
    color: "#82ca9d",
  },
  eco2: {
    checked: true,
    exists: false,
    color: "#9D82CA",
  },
  tvoc: {
    checked: true,
    exists: false,
    color: "#CA9D82",
  },
  aqi: {
    checked: true,
    exists: false,
    color: "#6342FC",
  },
};

function LineChartsSection(props: LineChartsSectionProps) {
  // State of the data points for the line chart.
  const [dataPointsLineChart, setDataPointsLineChart] = React.useState<
    InfluxAccess.Measurement[]
  >([]);
  // State checkboxes for the line chart (true if the checkbox is checked).
  const [lineChartState, setLineChartState] =
    React.useState<LineChartModel>(defaultLCModel);
  // State checkboxes for the bar chart
  const [barChartState, setBarChartState] = React.useState(true);

  /**
   * Change the data points structure to be able to use it in the line chart (each data point is a dictionary).
   *
   * @param dataPoints Array of data points.
   */
  function flattenDataPoints(dataPoints: InfluxAccess.Measurement[][]) {
    // Flatten the data points array.
    let flattenedDataPoints: InfluxAccess.Measurement[] = [];
    // For each data point, add it to the flattened array.
    dataPoints.forEach((dataPoint) => {
      dataPoint.forEach((measurement) => {
        flattenedDataPoints.push(measurement);
      });
    });
    // Update the data points state.
    setDataPointsLineChart(flattenedDataPoints);
  }

  /**
   * Change the data points structure to be able to use it in the line chart (each data point is a dictionary
   * with the mean of the data points of the same time frame).
   *
   * @param dataPoints Array of data points.
   */
  function meanDataPoints(dataPoints: InfluxAccess.Measurement[][]) {
    // Flatten the data points array.
    let meanDataPoints: InfluxAccess.Measurement[] = [];
    // For each data point, add it to the flattened array.
    dataPoints.forEach((dataPoint) => {
      // Calculate the mean of the data points.
      let meanMeasurement: { [key: string]: any } = {
        latitude: 0,
        longitude: 0,
        time: dataPoint[0].time,
        temperature: 0,
        pressure: 0,
        humidity: 0,
        eco2: 0,
        tvoc: 0,
        aqi: 0,
      };

      let countMeasurement: { [key: string]: any } = {
        temperature: 0,
        pressure: 0,
        humidity: 0,
        eco2: 0,
        tvoc: 0,
        aqi: 0,
      };

      dataPoint.forEach((measurement) => {
        Object.keys(measurement).forEach((key) => {
          // If the key is in the line chart state, set exist to true.
          // This will show and hide measurements that have no value
          if (
            (measurement as { [key: string]: any })[key] !== undefined &&
            key in lineChartState &&
            !lineChartState[key].exists
          ) {
            setLineChartState({
              ...lineChartState,
              [key]: { ...lineChartState[key], exists: true },
            });
          }

          // If the key is in the line chart state and the checkbox is checked, add the value to the mean.
          if (
            (measurement as { [key: string]: any })[key] !== undefined &&
            key in countMeasurement &&
            key in meanMeasurement
          ) {
            countMeasurement[key]++;
            meanMeasurement[key] += (measurement as { [key: string]: any })[
              key
            ];
          }
        });
      });

      Object.keys(countMeasurement).forEach((key) => {
        if (key in meanMeasurement) {
          meanMeasurement[key] /= countMeasurement[key];
        }
      });
      meanDataPoints.push(meanMeasurement as InfluxAccess.Measurement);
    });

    // Update the data points state.
    setDataPointsLineChart(meanDataPoints);
  }

  // Use effect for the line chart state (if the state changes, the line chart will be updated)
  React.useEffect(() => {
    // flattenDataPoints(dataPoints);
    meanDataPoints(props.dataPoints);
  }, [lineChartState]);

  return (
    <div className="flex flex-col p-4 gap-4 text-green-600">
      {/* Button switch chart visualization */}
      <label className="flex mx-auto items-center gap-4 cursor-pointer text-xl font-bold">
        {barChartState ? (
          <span>Visualizzazione compatta</span>
        ) : (
          <span className="text-slate-400">Visualizzazione compatta</span>
        )}
        <span className="relative">
          <input
            id="Toggle1"
            type="checkbox"
            className="hidden peer"
            onClick={() => setBarChartState(!barChartState)}
          />
          <div className="w-12 h-6 rounded-full shadow-inner bg-green-600"></div>
          <div className="absolute inset-y-0 left-0 w-4 h-4 m-1 rounded-full shadow peer-checked:right-0 peer-checked:left-auto bg-white"></div>
        </span>
        {!barChartState ? (
          <span>Visualizzazione estesa</span>
        ) : (
          <span className="text-slate-400">Visualizzazione estesa</span>
        )}
      </label>
      {barChartState ? (
        <div className="flex flex-row h-full items-center justify-center gap-2">
          <div className="w-5/6 m-4 aspect-[6/3]">
            <LineMonoGraph
              dataPointsLineChart={dataPointsLineChart}
              lineChartState={lineChartState}
            />
          </div>
          <div className="w-1/6 h-full">
            <LineControls
              lineChartState={lineChartState}
              setLineChartState={setLineChartState}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-row h-full items-center justify-center gap-2">
          <LineMultiGraph dataPointsLineChart={dataPointsLineChart} />
        </div>
      )}
    </div>
  );
}

export default LineChartsSection;
