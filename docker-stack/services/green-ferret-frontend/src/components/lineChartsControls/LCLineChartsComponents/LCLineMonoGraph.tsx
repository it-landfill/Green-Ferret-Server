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
import { LineChartModel } from "../../../utils/LineChartModel";

interface LineMonoGraphProps {
  dataPointsLineChart: InfluxAccess.Measurement[];
  lineChartState: LineChartModel;
  dataForcastingPoints: InfluxAccess.ForecastingMeasurement[];
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
          allowDuplicatedCategory={false}
        />

        {Object.keys(props.lineChartState)
          .filter((key) => props.lineChartState[key].exists)
          .map((key) =>
            props.lineChartState[key].checked ? (
              <YAxis
                key={key + "YAxisS"}
                dataKey={key}
                yAxisId={key}
                stroke={props.lineChartState[key].color}
                orientation="left"
                tick={{ fontSize: 12 }}
              />
            ) : (
              <YAxis
                key={key + "YAxisH"}
                dataKey={key}
                yAxisId={key}
                stroke="#D1D5DB"
                orientation="left"
                tick={{ fontSize: 12 }}
              />
            )
          )}

        {Object.keys(props.lineChartState)
          .filter((key) => props.lineChartState[key].exists)
          .map((key) =>
            props.lineChartState[key].checked ? (
              <Line
                key={key + "LineS"}
                dataKey={key}
                type="monotone"
                yAxisId={key}
                stroke={props.lineChartState[key].color}
                dot={false}
                activeDot={{ r: 6 }}
              />
            ) : (
              <Line
                key={key + "LineH"}
                dataKey={key}
                type="monotone"
                yAxisId={key}
                stroke="#D1D5DB"
                activeDot={{ r: 6 }}
                hide={true}
              />
            )
          )}

        <Line
          key="hatLine"
          dataKey="hatValue"
          yAxisId="hatValue"
          strokeDasharray="5 5"
          type="monotone"
          data={props.dataForcastingPoints}
          stroke="#D1D5DB"
          dot={false}
          activeDot={{ r: 6 }}
        />
        <Line
          key="lowerLine"
          dataKey="lowerValue"
          yAxisId="lowerValue"
          strokeDasharray="5 5"
          type="monotone"
          data={props.dataForcastingPoints}
          stroke="#D1D5DB"
          dot={false}
          activeDot={{ r: 6 }}
        />
        <Line
          key="upperValue"
          dataKey="upperValue"
          yAxisId="upperValue"
          strokeDasharray="5 5"
          type="monotone"
          data={props.dataForcastingPoints}
          stroke="#D1D5DB"
          dot={false}
          activeDot={{ r: 6 }}
        />
        <YAxis
          key="hatYAxis"
          dataKey="hatValue"
          yAxisId="hatValue"
          stroke="#D1D5DB"
          orientation="left"
          tick={{ fontSize: 12 }}
          hide={true}
        />
        <YAxis
          key="upperYAxis"
          dataKey="upperValue"
          yAxisId="upperValue"
          stroke="#D1D5DB"
          orientation="left"
          tick={{ fontSize: 12 }}
          hide={true}
        />
        <YAxis
          key="lowerYAxis"
          dataKey="lowerValue"
          yAxisId="lowerValue"
          stroke="#D1D5DB"
          orientation="left"
          tick={{ fontSize: 12 }}
          hide={true}
        />

        <Tooltip />
        <Legend />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default LineMonoGraph;
