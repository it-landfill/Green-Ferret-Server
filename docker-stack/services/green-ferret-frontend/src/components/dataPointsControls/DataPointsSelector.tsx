interface DataPointsControlSelectorProps {
  heatmapType: string;
  setHeatmapType: any;
}

function DataPointsSelectorController(props: DataPointsControlSelectorProps) {
  // Enum for the selected heatmap type.
  enum HeatmapType {
    TEMPERATURE = "temperature",
    PRESSURE = "pressure",
    HUMIDITY = "humidity",
    ECO2 = "eco2",
    TVOC = "tvoc",
    AQI = "aqi",
  }

  return (
    <div className="flex flex-col gap-2 m-4">
      <h2 className="text-2xl font-bold text-left text-green-600">
        Filtro heatmap
      </h2>
      <div className="flex items-center">
        <input
          id="default-radio-1"
          type="radio"
          value=""
          name="default-radio"
          className="w-4 h-4 accent-green-600"
          onChange={() => props.setHeatmapType(HeatmapType.TEMPERATURE)}
          checked={props.heatmapType === HeatmapType.TEMPERATURE}
        />
        <label className="ml-3 text-md font-medium text-gray-800">
          Visualizza temperatura{" "}
        </label>
      </div>
      <div className="flex items-center">
        <input
          id="default-radio-2"
          type="radio"
          value=""
          name="default-radio"
          className="w-4 h-4 accent-green-600"
          onChange={() => props.setHeatmapType(HeatmapType.PRESSURE)}
          checked={props.heatmapType === HeatmapType.PRESSURE}
        />
        <label className="ml-3 text-md font-medium text-gray-800">
          Visualizza pressione
        </label>
      </div>
      <div className="flex items-center">
        <input
          id="default-radio-3"
          type="radio"
          value=""
          name="default-radio"
          className="w-4 h-4 accent-green-600"
          onChange={() => props.setHeatmapType(HeatmapType.HUMIDITY)}
          checked={props.heatmapType === HeatmapType.HUMIDITY}
        />
        <label className="ml-3 text-md font-medium text-gray-800">
          Visualizza umidità
        </label>
      </div>
      <div className="flex items-center">
        <input
          id="default-radio-4"
          type="radio"
          value=""
          name="default-radio"
          className="w-4 h-4 accent-green-600"
          onChange={() => props.setHeatmapType(HeatmapType.ECO2)}
          checked={props.heatmapType === HeatmapType.ECO2}
        />
        <label className="ml-3 text-md font-medium text-gray-800">
          Visualizza CO2
        </label>
      </div>
      <div className="flex items-center">
        <input
          id="default-radio-5"
          type="radio"
          value=""
          name="default-radio"
          className="w-4 h-4 accent-green-600"
          onChange={() => props.setHeatmapType(HeatmapType.TVOC)}
          checked={props.heatmapType === HeatmapType.TVOC}
        />
        <label className="ml-3 text-md font-medium text-gray-800">
          Visualizza TVOC
        </label>
      </div>
      <div className="flex items-center">
        <input
          id="default-radio-6"
          type="radio"
          value=""
          name="default-radio"
          className="w-4 h-4 accent-green-600"
          onChange={() => props.setHeatmapType(HeatmapType.AQI)}
          checked={props.heatmapType === HeatmapType.AQI}
        />
        <label className="ml-3 text-md font-medium text-gray-800">
          Visualizza qualità dell'aria
        </label>
      </div>
    </div>
  );
}

export default DataPointsSelectorController;
