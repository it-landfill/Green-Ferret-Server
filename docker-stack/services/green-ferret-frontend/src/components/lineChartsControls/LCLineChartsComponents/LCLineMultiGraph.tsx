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

interface LineMultiGraphProps {
  dataPointsLineChart: InfluxAccess.Measurement[];
}

function LineMultiGraph(props: LineMultiGraphProps) {
  
  function renderLineChartSync(id: [string, string]) {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={props.dataPointsLineChart}
          syncId={id[1]}
          margin={{
            top: 5,
            right: 20,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis dataKey={id[0]} yAxisId={id[0]} orientation="left" />

          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey={id[0]}
            yAxisId={id[0]}
            stroke="#8884d8"
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <div className="w-5/6 h-full">
      <div className="grid grid-cols-2 h-screen p-2 gap-2">
        <div className="m-4 aspect-[6/3]">
          {renderLineChartSync(["temperature", "sync"])}
        </div>
        <div className="m-4 aspect-[6/3]">
          {renderLineChartSync(["pressure", "sync"])}
        </div>
        <div className="m-4 aspect-[6/3]">
          {renderLineChartSync(["humidity", "sync"])}
        </div>
        <div className="m-4 aspect-[6/3]">
          {renderLineChartSync(["eco2", "sync"])}
        </div>
        <div className="m-4 aspect-[6/3]">
          {renderLineChartSync(["tvoc", "sync"])}
        </div>
        <div className="m-4 aspect-[6/3]">
          {renderLineChartSync(["aqi", "sync"])}
        </div>
      </div>
    </div>
  );
}

export default LineMultiGraph;
