import React from "react";

import {
  ForcastingTypeModel,
  targetForcastingModel,
} from "../../../utils/ForcastingTypeModel";

import { LineChartModel } from "../../../utils/LineChartModel";

interface LineControlsProps {
  lineChartState: LineChartModel;
  forcastingInfomations: ForcastingTypeModel;
  setForcastingInfomations: any;
}

function LineForecastingControls(props: LineControlsProps) {
  const [LineCheckboxList, setLineCheckboxList] = React.useState<any[]>([]);

  /**
   * Change the forcasting target.
   *
   * @param targetKey The new forcasting target key (temperature, humidity, pressure, eco2, tvoc, aqi).
   */
  function changeForcastingTarget(targetKey: string) {
    // Create a new forcasting model.
    let newForcastingModel: ForcastingTypeModel = props.forcastingInfomations;
    // Reset the forcasting model target keys.
    for (const key in newForcastingModel.target)
      newForcastingModel.target[key as keyof targetForcastingModel] = false;
    // Set the new target key.
    newForcastingModel.target[targetKey as keyof targetForcastingModel] = true;
    props.setForcastingInfomations(newForcastingModel);
  }

  React.useEffect(() => {
    const LineCheckboxList = Object.keys(props.lineChartState)
      .filter((key) => props.lineChartState[key].exists)
      .map((key) => (
        <div className="flex items-center" key={key}>
          <input
            id={"default-radio-taget-" + key}
            type="radio"
            value=""
            name="default-radio-target-forcasting"
            className="w-4 h-4 accent-green-600"
            onChange={() => {
              changeForcastingTarget(key);
            }}
            key={key}
          />
          <label
            htmlFor={"default-radio-taget-" + key}
            className="ml-3 text-md font-medium text-gray-800"
          >
            {"Visualizza " + key}
          </label>
        </div>
      ));
    setLineCheckboxList(LineCheckboxList);
  }, [props.lineChartState]);

  return (
    <div className="flex flex-col h-full gap-2 m-4">
      <h2 className="text-2xl font-bold text-left text-green-600">
        Target Forecasting
      </h2>
      {LineCheckboxList}
    </div>
  );
}

export default LineForecastingControls;
