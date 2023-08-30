import { LineChartModel } from "../../../../utils/LineChartModel";

interface LineCheckboxProps {
  setLineChartState: React.Dispatch<React.SetStateAction<LineChartModel>>;
  lineChartTopic: string;
  lineChartState: LineChartModel;
}

function LineCheckbox(props: LineCheckboxProps) {
  return (
    <div className="flex items-center">
      <input
        checked={props.lineChartState[props.lineChartTopic].checked}
        id={"Checkbox-" + props.lineChartTopic}
        type="checkbox"
        className="w-4 h-4 bg-gray-100 border-gray-300 accent-green-600"
        onChange={() =>
          props.setLineChartState({
            ...props.lineChartState,
            [props.lineChartTopic]: {
              ...props.lineChartState[props.lineChartTopic],
              checked: !props.lineChartState[props.lineChartTopic].checked,
            },
          })
        }
      />
      <label
        htmlFor={"Checkbox-" + props.lineChartTopic}
        className="ml-3 text-md font-medium text-gray-900 dark:text-gray-600"
      >
        Visualizza {props.lineChartTopic}
      </label>
    </div>
  );
}

export default LineCheckbox;
