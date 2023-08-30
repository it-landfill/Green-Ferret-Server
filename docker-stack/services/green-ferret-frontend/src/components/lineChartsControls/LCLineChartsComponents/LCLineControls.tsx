import React from "react";

import LineCheckbox from "./LCLineControlsComponents/LCLineCheckbox";
import { LineChartModel } from "../../../utils/LineChartModel";

interface LineControlsProps {
  setLineChartState: React.Dispatch<React.SetStateAction<LineChartModel>>;
  lineChartState: LineChartModel;
}

function LineControls(props: LineControlsProps) {

  const [LineCheckboxList, setLineCheckboxList] = React.useState<any[]>([]);

  React.useEffect(() => {
    // For each props.lineChartState key, create a LineCheckbox component.
    const LineCheckboxList = Object.keys(props.lineChartState)
    .filter((key) => props.lineChartState[key].exists)
    .map((key) => (
      <LineCheckbox
        key={key}
        lineChartState={props.lineChartState}
        lineChartTopic={key}
        setLineChartState={props.setLineChartState}
      />
    ));
    setLineCheckboxList(LineCheckboxList);
  }, [props.lineChartState, props.setLineChartState]);

  return (
    <div className="flex flex-col h-full gap-2 m-4">
      <h2 className="text-2xl font-bold text-left text-green-600">
        Filtro grafico
      </h2>
      {LineCheckboxList}
    </div>
  );
}

export default LineControls;
