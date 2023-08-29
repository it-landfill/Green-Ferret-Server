import { Line, YAxis } from "recharts";

interface LineYAxisProps {
  lineChartTopic: string;
  lineColor: string;
  lineOrientation: "left" | "right";
  lineChartState: any;
}

function LineYAxis(props: LineYAxisProps) {
  return props.lineChartState[props.lineChartTopic] ? (
    <>
      <YAxis
        dataKey={props.lineChartTopic}
        yAxisId={props.lineChartTopic}
        stroke={props.lineColor}
        orientation={props.lineOrientation}
        tick={{ fontSize: 12 }}
      />
      <Line
        type="monotone"
        dataKey={props.lineChartTopic}
        yAxisId={props.lineChartTopic}
        stroke={props.lineColor}
        activeDot={{ r: 6 }}
      />
    </>
  ) : (
    // If temperature is not selected, render an empty YAxis. This is done to avoid the YAxis to be rendered with the wrong color.
    <YAxis
      dataKey={props.lineChartTopic}
      yAxisId={props.lineChartTopic}
      orientation={props.lineOrientation}
      tick={{ fontSize: 12 }}
    />
  );
}

export default LineYAxis;
