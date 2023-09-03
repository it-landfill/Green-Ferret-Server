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
import {
  ForcastingTypeModel,
  targetForcastingModel,
} from "../../../utils/ForcastingTypeModel";

interface LineMonoGraphProps {
  dataPointsLineChart: InfluxAccess.Measurement[];
  lineChartState: LineChartModel;
  forcastingInfomations: ForcastingTypeModel;
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

  function colorChangeKeyBased(isBound: boolean = false) {
    let key = Object.keys(props.forcastingInfomations.target).find(
      (key) =>
        props.forcastingInfomations.target[
          key as keyof targetForcastingModel
        ] === true
    );
    switch (key) {
      case "temperature":
        if (isBound) return [key, "#8884A0"];
        return [key, "#8884D8"];
      case "humidity":
        if (isBound) return [key, "#A0829D"];
        return [key, "#CA829D"];
      case "pressure":
        if (isBound) return [key, "#82A09D"];
        return [key, "#82CA9D"];
      case "eco2":
        if (isBound) return [key, "#9D82A0"];
        return [key, "#9D82CA"];
      case "tvoc":
        if (isBound) return [key, "#A09D82"];
        return [key, "#CA9D82"];
      case "aqi":
        if (isBound) return [key, "#6342A0"];
        return [key, "#6342FC"];
      default:
        return [key, "#000000"];
    }
  }

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
          name={colorChangeKeyBased()[0] + " forcasting"}
          dataKey="hatValue"
          yAxisId="hatValue"
          strokeDasharray="5 5"
          type="monotone"
          data={props.dataForcastingPoints}
          stroke={colorChangeKeyBased()[1]}
          dot={false}
          activeDot={{ r: 6 }}
        />
        <Line
          key="lowerLine"
          name={colorChangeKeyBased()[0] + " lower bound"}
          dataKey="lowerValue"
          yAxisId="lowerValue"
          strokeDasharray="5 5"
          type="monotone"
          data={props.dataForcastingPoints}
          stroke={colorChangeKeyBased(true)[1]}
          dot={false}
          activeDot={{ r: 6 }}
        />
        <Line
          key="upperValue"
          name={colorChangeKeyBased()[0] + " upper bound"}
          dataKey="upperValue"
          yAxisId="upperValue"
          strokeDasharray="5 5"
          type="monotone"
          data={props.dataForcastingPoints}
          stroke={colorChangeKeyBased(true)[1]}
          dot={false}
          activeDot={{ r: 6 }}
        />
        <YAxis
          key="hatYAxis"
          dataKey="hatValue"
          yAxisId="hatValue"
          stroke={colorChangeKeyBased()[1]}
          orientation="left"
          tick={{ fontSize: 12 }}
          hide={true}
        />
        <YAxis
          key="upperYAxis"
          dataKey="upperValue"
          yAxisId="upperValue"
          stroke={colorChangeKeyBased(true)[1]}
          orientation="left"
          tick={{ fontSize: 12 }}
          hide={true}
        />
        <YAxis
          key="lowerYAxis"
          dataKey="lowerValue"
          yAxisId="lowerValue"
          stroke={colorChangeKeyBased(true)[1]}
          orientation="left"
          tick={{ fontSize: 12 }}
          hide={true}
        />
        <Tooltip />
        <Legend wrapperStyle={{ bottom: -5, fontSize: 15 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default LineMonoGraph;
