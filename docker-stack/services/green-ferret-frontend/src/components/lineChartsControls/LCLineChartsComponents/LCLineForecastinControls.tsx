import React from "react";

import { LineChartModel } from "../../../utils/LineChartModel";

interface LineControlsProps {
  setLineChartState: React.Dispatch<React.SetStateAction<LineChartModel>>;
  lineChartState: LineChartModel;
}

function LineForecastingControls(props: LineControlsProps) {
  const [LineCheckboxList, setLineCheckboxList] = React.useState<any[]>([]);

  React.useEffect(() => {
    const LineCheckboxList = Object.keys(props.lineChartState)
      .filter((key) => props.lineChartState[key].exists)
      .map((key) => (
        <div className="flex items-center">
          <input
            id={"default-radio-taget-" + key}
            type="radio"
            value=""
            name="default-radio-target-forcasting"
            className="w-4 h-4 accent-green-600"
            onChange={() => {}}
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
  }, [props.lineChartState, props.setLineChartState]);

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
