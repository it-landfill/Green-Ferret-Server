import React from "react";

import {
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
} from "recharts";

import { InfluxAccess } from "../../../utils/InfluxAccess";

interface LineMonoGraphProps {
  dataPointsLineChart: InfluxAccess.Measurement[];
  lineChartState: { [key: string]: boolean };
}

function LineMonoGraph(props: LineMonoGraphProps) {
  // Simplified date format (DD/MM HH:MM).
  const dateFormat = (date: Date) => {
    return `${date.getDate()}/${date.getMonth() + 1} ${date
      .getHours()
      .toString()
      .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={props.dataPointsLineChart}
        margin={{
          top: 25,
          right: 30,
          left: 20,
          bottom: 25,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis
          dataKey="time"
          tickFormatter={dateFormat}
          tick={{ fontSize: 12 }}
          dy={10}
        />

        {Object.keys(props.lineChartState).map((key) =>
          props.lineChartState[key] ? (
            <>
              <YAxis
                key={key + "YAxis"}
                dataKey={key}
                yAxisId={key}
                stroke="#8884d8"
                orientation="left"
                tick={{ fontSize: 12 }}
              />
              <Line
                key={key + "Line"}
                dataKey={key}
                type="monotone"
                yAxisId={key}
                stroke="#8884d8"
                dot={false}
                activeDot={{ r: 6 }}
              />
            </>
          ) : (
            <>
              <YAxis
                key={key + "YAxis"}
                dataKey={key}
                yAxisId={key}
                stroke="#D1D5DB"
                orientation="left"
                tick={{ fontSize: 12 }}
              />
              <Line
                key={key + "Line"}
                dataKey={key}
                type="monotone"
                yAxisId={key}
                stroke="#D1D5DB"
                activeDot={{ r: 6 }}
                hide={true}
              />
            </>
          )
        )}

        <Tooltip />
        <Legend />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default LineMonoGraph;
