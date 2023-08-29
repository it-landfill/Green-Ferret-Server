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

import { InfluxAccess } from "../../../utils/InfluxAccess";

interface LineMonoGraphProps {
  dataPointsLineChart: InfluxAccess.Measurement[];
  lineChartState: any;
}

function LineMonoGraph(props: LineMonoGraphProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={props.dataPointsLineChart}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" tick={{ fontSize: 12 }} dy={10} />

        {props.lineChartState.temperature && (
          <YAxis
            dataKey="temperature"
            yAxisId="temperature"
            stroke="#8884d8"
            orientation="left"
            tick={{ fontSize: 12 }}
          />
        )}
        {props.lineChartState.pressure && (
          <YAxis
            dataKey="pressure"
            yAxisId="pressure"
            stroke="#82ca9d"
            orientation="left"
            tick={{ fontSize: 12 }}
          />
        )}
        {props.lineChartState.humidity && (
          <YAxis
            dataKey="humidity"
            yAxisId="humidity"
            stroke="#CA829D"
            orientation="left"
            tick={{ fontSize: 12 }}
          />
        )}
        {props.lineChartState.eco && (
          <YAxis
            dataKey="eco2"
            yAxisId="eco"
            stroke="#9D82CA"
            orientation="right"
            tick={{ fontSize: 12 }}
          />
        )}
        {props.lineChartState.tvoc && (
          <YAxis
            dataKey="tvoc"
            yAxisId="tvoc"
            stroke="#CA9D82"
            orientation="right"
            tick={{ fontSize: 12 }}
          />
        )}
        {props.lineChartState.aqi && (
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
        {props.lineChartState.temperature && (
          <Line
            type="monotone"
            dataKey="temperature"
            yAxisId="temperature"
            stroke="#8884d8"
            activeDot={{ r: 6 }}
          />
        )}
        {props.lineChartState.pressure && (
          <Line
            type="monotone"
            dataKey="pressure"
            yAxisId="pressure"
            stroke="#82ca9d"
            activeDot={{ r: 6 }}
          />
        )}
        {props.lineChartState.humidity && (
          <Line
            type="monotone"
            dataKey="humidity"
            yAxisId="humidity"
            stroke="#CA829D"
            activeDot={{ r: 6 }}
          />
        )}
        {props.lineChartState.eco && (
          <Line
            type="monotone"
            dataKey="eco2"
            yAxisId="eco"
            stroke="#9D82CA"
            activeDot={{ r: 6 }}
          />
        )}
        {props.lineChartState.tvoc && (
          <Line
            type="monotone"
            dataKey="tvoc"
            yAxisId="tvoc"
            stroke="#CA9D82"
            activeDot={{ r: 6 }}
          />
        )}
        {props.lineChartState.aqi && (
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

export default LineMonoGraph;
