interface LineControlsProps {
  setLineChartState: any;
  lineChartState: any;
}

function LineControls(props: LineControlsProps) {
  return (
    <div className="flex flex-col h-full gap-2 m-4">
      <h2 className="text-2xl font-bold text-left text-green-600">
        Filtro grafico
      </h2>
      <div className="flex items-center">
        {props.lineChartState.temperature ? (
          <input
            checked
            id="default-checkbox"
            type="checkbox"
            className="w-4 h-4 bg-gray-100 border-gray-300 accent-green-600"
            onChange={() =>
              props.setLineChartState({
                ...props.lineChartState,
                temperature: !props.lineChartState.temperature,
              })
            }
          />
        ) : (
          <input
            id="default-checkbox"
            type="checkbox"
            className="w-4 h-4 bg-gray-100 border-gray-300"
            onChange={() =>
              props.setLineChartState({
                ...props.lineChartState,
                temperature: !props.lineChartState.temperature,
              })
            }
          />
        )}
        <label
          htmlFor="default-checkbox"
          className="ml-3 text-md font-medium text-gray-900 dark:text-gray-600"
        >
          Visualizza temperatura
        </label>
      </div>
      <div className="flex items-center">
        {props.lineChartState.pressure ? (
          <input
            checked
            id="default-checkbox"
            type="checkbox"
            className="w-4 h-4 bg-gray-100 border-gray-300 accent-green-600"
            onChange={() =>
              props.setLineChartState({
                ...props.lineChartState,
                pressure: !props.lineChartState.pressure,
              })
            }
          />
        ) : (
          <input
            id="default-checkbox"
            type="checkbox"
            className="w-4 h-4 bg-gray-100 border-gray-300"
            onChange={() =>
              props.setLineChartState({
                ...props.lineChartState,
                pressure: !props.lineChartState.pressure,
              })
            }
          />
        )}
        <label
          htmlFor="default-checkbox"
          className="ml-3 text-md font-medium text-gray-900 dark:text-gray-600"
        >
          Visualizza pressione
        </label>
      </div>
      <div className="flex items-center">
        {props.lineChartState.humidity ? (
          <input
            checked
            id="default-checkbox"
            type="checkbox"
            className="w-4 h-4 bg-gray-100 border-gray-300 accent-green-600"
            onChange={() =>
              props.setLineChartState({
                ...props.lineChartState,
                humidity: !props.lineChartState.humidity,
              })
            }
          />
        ) : (
          <input
            id="default-checkbox"
            type="checkbox"
            className="w-4 h-4 bg-gray-100 border-gray-300"
            onChange={() =>
              props.setLineChartState({
                ...props.lineChartState,
                humidity: !props.lineChartState.humidity,
              })
            }
          />
        )}
        <label
          htmlFor="default-checkbox"
          className="ml-3 text-md font-medium text-gray-900 dark:text-gray-600"
        >
          Visualizza umidità
        </label>
      </div>
      <div className="flex items-center">
        {props.lineChartState.eco ? (
          <input
            checked
            id="default-checkbox"
            type="checkbox"
            className="w-4 h-4 bg-gray-100 border-gray-300 accent-green-600"
            onChange={() =>
              props.setLineChartState({
                ...props.lineChartState,
                eco: !props.lineChartState.eco,
              })
            }
          />
        ) : (
          <input
            id="default-checkbox"
            type="checkbox"
            className="w-4 h-4 bg-gray-100 border-gray-300"
            onChange={() =>
              props.setLineChartState({
                ...props.lineChartState,
                eco: !props.lineChartState.eco,
              })
            }
          />
        )}
        <label
          htmlFor="default-checkbox"
          className="ml-3 text-md font-medium text-gray-900 dark:text-gray-600"
        >
          Visualizza CO2
        </label>
      </div>
      <div className="flex items-center">
        {props.lineChartState.tvoc ? (
          <input
            checked
            id="default-checkbox"
            type="checkbox"
            className="w-4 h-4 bg-gray-100 border-gray-300 accent-green-600"
            onChange={() =>
              props.setLineChartState({
                ...props.lineChartState,
                tvoc: !props.lineChartState.tvoc,
              })
            }
          />
        ) : (
          <input
            id="default-checkbox"
            type="checkbox"
            className="w-4 h-4 bg-gray-100 border-gray-300"
            onChange={() =>
              props.setLineChartState({
                ...props.lineChartState,
                tvoc: !props.lineChartState.tvoc,
              })
            }
          />
        )}
        <label
          htmlFor="default-checkbox"
          className="ml-3 text-md font-medium text-gray-900 dark:text-gray-600"
        >
          Visualizza TVOC
        </label>
      </div>
      <div className="flex items-center">
        {props.lineChartState.aqi ? (
          <input
            checked
            id="default-checkbox"
            type="checkbox"
            className="w-4 h-4 bg-gray-100 border-gray-300 accent-green-600"
            onChange={() =>
              props.setLineChartState({
                ...props.lineChartState,
                aqi: !props.lineChartState.aqi,
              })
            }
          />
        ) : (
          <input
            id="default-checkbox"
            type="checkbox"
            className="w-4 h-4 bg-gray-100 border-gray-300"
            onChange={() =>
              props.setLineChartState({
                ...props.lineChartState,
                aqi: !props.lineChartState.aqi,
              })
            }
          />
        )}
        <label
          htmlFor="default-checkbox"
          className="ml-3 text-md font-medium text-gray-900 dark:text-gray-600"
        >
          Visualizza qualità dell'aria
        </label>
      </div>
    </div>
  );
}

export default LineControls;
