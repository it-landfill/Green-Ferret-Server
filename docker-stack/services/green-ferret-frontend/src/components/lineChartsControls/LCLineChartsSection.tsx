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

interface LineChartsSectionProps {
  dataPoints: InfluxAccess.Measurement[][];
}

function LineChartsSection(props: LineChartsSectionProps) {
  // State of the data points for the line chart.
  const [dataPointsLineChart, setDataPointsLineChart] = React.useState<
    InfluxAccess.Measurement[]
  >([]);
  // State checkboxes for the line chart (true if the checkbox is checked).
  const [lineChartState, setLineChartState] = React.useState({
    temperature: true,
    pressure: true,
    humidity: true,
    eco: true,
    tvoc: true,
    aqi: true,
  });
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
      let meanMeasurement: InfluxAccess.Measurement = {
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
      dataPoint.forEach((measurement) => {
        meanMeasurement.temperature += measurement.temperature;
        meanMeasurement.pressure += measurement.pressure;
        meanMeasurement.humidity += measurement.humidity;
        meanMeasurement.eco2 += measurement.eco2;
        meanMeasurement.tvoc += measurement.tvoc;
        meanMeasurement.aqi += measurement.aqi;
      });
      meanMeasurement.temperature /= dataPoint.length;
      meanMeasurement.pressure /= dataPoint.length;
      meanMeasurement.humidity /= dataPoint.length;
      meanMeasurement.eco2 /= dataPoint.length;
      meanMeasurement.tvoc /= dataPoint.length;
      meanMeasurement.aqi /= dataPoint.length;
      meanDataPoints.push(meanMeasurement);
    });

    // Update the data points state.
    setDataPointsLineChart(meanDataPoints);
  }

  // Use effect for the line chart state (if the state changes, the line chart will be updated)
  React.useEffect(() => {
    // flattenDataPoints(dataPoints);
    meanDataPoints(props.dataPoints);
    renderLineChart();
  }, [lineChartState]);

  function renderLineChart() {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={dataPointsLineChart}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" tick={{ fontSize: 12 }} dy={10} />

          {lineChartState.temperature && (
            <YAxis
              dataKey="temperature"
              yAxisId="temperature"
              stroke="#8884d8"
              orientation="left"
              tick={{ fontSize: 12 }}
            />
          )}
          {lineChartState.pressure && (
            <YAxis
              dataKey="pressure"
              yAxisId="pressure"
              stroke="#82ca9d"
              orientation="left"
              tick={{ fontSize: 12 }}
            />
          )}
          {lineChartState.humidity && (
            <YAxis
              dataKey="humidity"
              yAxisId="humidity"
              stroke="#CA829D"
              orientation="left"
              tick={{ fontSize: 12 }}
            />
          )}
          {lineChartState.eco && (
            <YAxis
              dataKey="eco2"
              yAxisId="eco"
              stroke="#9D82CA"
              orientation="right"
              tick={{ fontSize: 12 }}
            />
          )}
          {lineChartState.tvoc && (
            <YAxis
              dataKey="tvoc"
              yAxisId="tvoc"
              stroke="#CA9D82"
              orientation="right"
              tick={{ fontSize: 12 }}
            />
          )}
          {lineChartState.aqi && (
            <YAxis
              dataKey="aqi"
              yAxisId="aqi"
              stroke="#6342FC"
              orientation="right"
              tick={{ fontSize: 12 }}
            />
          )}

          <Tooltip />
          <Legend />
          {lineChartState.temperature && (
            <Line
              type="monotone"
              dataKey="temperature"
              yAxisId="temperature"
              stroke="#8884d8"
              activeDot={{ r: 6 }}
            />
          )}
          {lineChartState.pressure && (
            <Line
              type="monotone"
              dataKey="pressure"
              yAxisId="pressure"
              stroke="#82ca9d"
              activeDot={{ r: 6 }}
            />
          )}
          {lineChartState.humidity && (
            <Line
              type="monotone"
              dataKey="humidity"
              yAxisId="humidity"
              stroke="#CA829D"
              activeDot={{ r: 6 }}
            />
          )}
          {lineChartState.eco && (
            <Line
              type="monotone"
              dataKey="eco2"
              yAxisId="eco"
              stroke="#9D82CA"
              activeDot={{ r: 6 }}
            />
          )}
          {lineChartState.tvoc && (
            <Line
              type="monotone"
              dataKey="tvoc"
              yAxisId="tvoc"
              stroke="#CA9D82"
              activeDot={{ r: 6 }}
            />
          )}
          {lineChartState.aqi && (
            <Line
              type="monotone"
              dataKey="aqi"
              yAxisId="aqi"
              stroke="#6342FC"
              activeDot={{ r: 6 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    );
  }


  return (
    <div className="flex flex-col p-4 gap-4 text-green-600">
      <h1 className="text-4xl font-bold text-left">Green Ferrett</h1>
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
