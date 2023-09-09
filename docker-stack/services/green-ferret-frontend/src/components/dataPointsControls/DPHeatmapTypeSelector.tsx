import React from "react";
import HeatmapTypeRadioButton from "./DPHeatmapTypeComponents/DPHeatmapTypeRadioButton";

interface HeatmapTypeSelectorProps {
  dataPoints: any;
  heatmapType: string;
  setHeatmapType: any;
}

function HeatmapTypeSelector(props: HeatmapTypeSelectorProps) {
  const [HeatmapTypeList, setHeatmapTypeList] = React.useState<any[]>([]);

  // Enum for the selected heatmap type.
  enum HeatmapType {
    TEMPERATURE = "temperature",
    PRESSURE = "pressure",
    HUMIDITY = "humidity",
    ECO2 = "eco2",
    TVOC = "tvoc",
    AQI = "aqi",
  }

  /**
   *  Checks if the dataPoints array is empty for the selected heatmap type.
   *
   * @param dataPoints The dataPoints array.
   * @param heatmapType The selected heatmap type.
   */
  function isEmpty(dataPoints: any, heatmapType: string) {
    // Cycle through the dataPoints array.
    for (let i = 0; i < dataPoints.length; i++) {
      for (let j = 0; j < dataPoints[i].length; j++) {
        // Check if the dataPoint is not undefined
        if (dataPoints[i][j] !== undefined) {
          // Check if the dataPoint has the selected heatmap type and it's not undefined.
          if (dataPoints[i][j][heatmapType] !== undefined) {
            return false;
          }
        }
      }
    }
    return true;
  }

  React.useEffect(() => {
    // Create an array of HeatmapTypeRadioButton components.
    const HeatmapTypeList = (
      Object.keys(HeatmapType) as (keyof typeof HeatmapType)[]
    ).map((key) =>
      // Check if the dataPoints array is empty for the selected heatmap type.
      isEmpty(props.dataPoints, HeatmapType[key]) ? null : (
        <HeatmapTypeRadioButton
          key={key}
          heatmapType={props.heatmapType}
          setHeatmapType={props.setHeatmapType}
          enum={HeatmapType[key]}
        />
      )
    );
    setHeatmapTypeList(HeatmapTypeList);
  }, [props.dataPoints, props.heatmapType]);

  return (
    <div className="flex flex-col gap-2 m-4">
      <h2 className="text-2xl font-bold text-left text-green-600">
        Filtro heatmap
      </h2>
      {HeatmapTypeList}
    </div>
  );
}

export default HeatmapTypeSelector;
