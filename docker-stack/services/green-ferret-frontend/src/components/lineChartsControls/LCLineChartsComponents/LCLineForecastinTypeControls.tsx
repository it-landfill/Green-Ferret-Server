import { ForcastingTypeModel } from "../../../utils/ForcastingTypeModel";

interface ForecastinTypeControlsProps {
  forcastingInfomations: ForcastingTypeModel;
  setForcastingInfomation: any;
}

function ForecastinTypeControls(props: ForecastinTypeControlsProps) {
  function changeForcastingType(type: string) {
    let newForcastingModel: ForcastingTypeModel = {
      type: {
        none: false,
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

    switch (type) {
      case "none":
        newForcastingModel.type.none = true;
        break;
      case "arima":
        newForcastingModel.type.ARIMA = true;
        break;
      case "prophet":
        newForcastingModel.type.PROPHET = true;
        break;
      default:
        break;
    }

    props.setForcastingInfomation(newForcastingModel);
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
          checked={props.forcastingInfomations.type.none === true}
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
          checked={props.forcastingInfomations.type.ARIMA === true}
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
          checked={props.forcastingInfomations.type.PROPHET === true}
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

export default ForecastinTypeControls;
