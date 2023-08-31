import React from "react";

import { InfluxAccess } from "../../utils/InfluxAccess";
import { LineChartModel } from "../../utils/LineChartModel";
import { ForcastingTypeModel } from "../../utils/ForcastingTypeModel";

import LineControls from "./LCLineChartsComponents/LCLineControls";
import LineMonoGraph from "./LCLineChartsComponents/LCLineMonoGraph";
import ForecastinTypeControls from "./LCLineChartsComponents/LCLineForecastingTypeControls";
import ForecastingControls from "./LCLineChartsComponents/LCLineForecastingTargetControls";

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

const defaultForcatingModel: ForcastingTypeModel = {
  type: {
    none: true,
    ARIMA: false,
    PROPHET: false,
  },
  target: {
    temperature: false,
    humidity: false,
    pressure: false,
    eco2: false,
    tvoc: false,
    aqi: false,
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

  const [forcastingInfomations, setForcastingInfomations] = React.useState<any>(
    defaultForcatingModel
  );

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
    meanDataPoints(props.dataPoints);
  }, [lineChartState]);

  return (
    <div className="flex flex-col p-4 gap-4 text-green-600">
      <div className="flex flex-row h-full items-center justify-center gap-2">
        <div className="w-4/5 m-4 aspect-[6/3]">
          <LineMonoGraph
            dataPointsLineChart={dataPointsLineChart}
            lineChartState={lineChartState}
          />
        </div>
        <div className="w-1/5 h-full gap-2">
          <LineControls
            lineChartState={lineChartState}
            setLineChartState={setLineChartState}
          />
          <div className="w-2/3 border-t-[1px]  border-green-600 mx-auto"></div>
          <ForecastinTypeControls
            forcastingInfomations={forcastingInfomations}
            setForcastingInfomations={setForcastingInfomations}
          />
          <div className="w-2/3 border-t-[1px]  border-green-600 mx-auto"></div>
          <ForecastingControls
            lineChartState={lineChartState}
            forcastingInfomations={forcastingInfomations}
            setForcastingInfomations={setForcastingInfomations}
          />
        </div>
      </div>
    </div>
  );
}

export default LineChartsSection;
