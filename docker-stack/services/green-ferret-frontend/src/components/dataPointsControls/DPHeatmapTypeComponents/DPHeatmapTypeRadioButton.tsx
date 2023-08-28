interface HeatmapTypeRadioButtonProps {
  heatmapType: string;
  setHeatmapType: any;
  enum: string;
}

function HeatmapTypeRadioButton(props: HeatmapTypeRadioButtonProps) {

  return (
    <div className="flex items-center">
      <input
        id={"default-radio-" + props.enum}
        type="radio"
        value=""
        name="default-radio"
        className="w-4 h-4 accent-green-600"
        onChange={() => props.setHeatmapType(props.enum)}
        checked={props.heatmapType === props.enum}
      />
      <label className="ml-3 text-md font-medium text-gray-800">
        {"Visualizza " + props.enum}
      </label>
    </div>
  );
}

export default HeatmapTypeRadioButton;
