import React from "react";

import {
  LineChart,
  XAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { InfluxAccess } from "../../../utils/InfluxAccess";

import LineYAxis from "./LCLineMonoGraphComponents/LCLineYAxis";

interface LineMonoGraphProps {
  dataPointsLineChart: InfluxAccess.Measurement[];
  lineChartState: any;
}

function LineMonoGraph(props: LineMonoGraphProps) {
  const [LineList, setLineList] = React.useState<any[]>([]);

  // Simplified date format (DD/MM HH:MM).
  const dateFormat = (date: Date) => {
    return `${date.getDate()}/${date.getMonth() + 1} ${date
      .getHours()
      .toString()
      .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  };

  React.useEffect(() => {
    // For each props.lineChartState key, create a Line component.
    const LineList = Object.keys(props.lineChartState).map((key) => (
      <LineYAxis
        key={key}
        lineChartState={props.lineChartState}
        lineChartTopic={key}
        lineColor="#8884d8"
        lineOrientation="left"
      />
    ));
    setLineList(LineList);
  }, [props.lineChartState]);

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

        <LineYAxis
          key="humidity"
          lineChartState={props.lineChartState}
          lineChartTopic="humidity"
          lineColor="#8884d8"
          lineOrientation="left"
        />

        <Tooltip />
        <Legend />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default LineMonoGraph;
