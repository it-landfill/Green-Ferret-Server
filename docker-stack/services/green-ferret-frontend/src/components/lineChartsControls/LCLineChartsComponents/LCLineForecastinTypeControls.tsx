interface LineForecastingTypeProps {
  forcastingInformation: any;
  setForcastingInfomation: any;
}

function LineForecastingTypeControls(props: LineForecastingTypeProps) {
  function changeForcastingType(type: string) {
    for (let key in props.forcastingInformation.type) {
      props.forcastingInformation.type[key] = false;
    }
    props.forcastingInformation.type[type] = true;
    props.setForcastingInfomation(props.forcastingInformation);
  }

  return (
    <div className="flex flex-col h-full gap-2 m-4">
      <h2 className="text-2xl font-bold text-left text-green-600">
        Filtro Forecasting
      </h2>
      <div className="flex items-center">
        <input
          id="default-radio-none"
          type="radio"
          value=""
          name="default-radio-forcasting"
          className="w-4 h-4 accent-green-600"
          checked={props.forcastingInformation.type.none === true}
          onChange={() => {
            changeForcastingType("none");
          }}
        />
        <label className="ml-3 text-md font-medium text-gray-800">
          Nessun forecasting selezionato
        </label>
      </div>
      <div className="flex items-center">
        <input
          id="default-radio-arima-forcasting"
          type="radio"
          value=""
          name="default-radio-forcasting"
          className="w-4 h-4 accent-green-600"
          checked={props.forcastingInformation.type.arima === true}
          onChange={() => {
            changeForcastingType("arima");
          }}
        />
        <label className="ml-3 text-md font-medium text-gray-800">
          Visualizza il forecasting ARIMA
        </label>
      </div>
      <div className="flex items-center">
        <input
          id="default-radio-prophet-forcasting"
          type="radio"
          value=""
          name="default-radio-forcasting"
          className="w-4 h-4 accent-green-600"
          checked={props.forcastingInformation.type.prophet === true}
          onChange={() => {
            changeForcastingType("prophet");
          }}
        />
        <label className="ml-3 text-md font-medium text-gray-800">
          Visualizza il forecasting PROPHET
        </label>
      </div>
    </div>
  );
}

export default LineForecastingTypeControls;
