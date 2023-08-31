import {
  ForcastingTypeModel,
  typeForcastingModel,
} from "../../../utils/ForcastingTypeModel";

interface ForecastinTypeControlsProps {
  forcastingInfomations: ForcastingTypeModel;
  setForcastingInfomations: any;
}

function ForecastinTypeControls(props: ForecastinTypeControlsProps) {
  /**
   * Change the forcasting type.
   *
   * @param typeKey The new forcasting type key (none, ARIMA, PROPHET).
   */
  function changeForcastingType(typeKey: string) {
    // Create a new forcasting model.
    let newForcastingModel: ForcastingTypeModel = props.forcastingInfomations;
    // Reset the forcasting model type keys.
    for (const key in newForcastingModel.type)
      newForcastingModel.type[key as keyof typeForcastingModel] = false;
    // Set the new target key.
    newForcastingModel.type[typeKey as keyof typeForcastingModel] = true;
    props.setForcastingInfomations(newForcastingModel);
  }

  return (
    <div className="flex flex-col h-full gap-2 m-4">
      <h2 className="text-2xl font-bold text-left text-green-600">
        Filtro Forecasting
      </h2>
      <div className="flex items-center">
        <input
          id="default-radio-type-none"
          type="radio"
          value=""
          name="default-radio-type-forcasting"
          className="w-4 h-4 accent-green-600"
          onChange={() => {
            changeForcastingType("none");
          }}
        />
        <label
          htmlFor={"default-radio-type-none"}
          className="ml-3 text-md font-medium text-gray-800"
        >
          Nessun forecasting selezionato
        </label>
      </div>
      <div className="flex items-center">
        <input
          id="default-radio-type-arima"
          type="radio"
          value=""
          name="default-radio-type-forcasting"
          className="w-4 h-4 accent-green-600"
          onChange={() => {
            changeForcastingType("ARIMA");
          }}
        />
        <label
          htmlFor={"default-radio-type-arima"}
          className="ml-3 text-md font-medium text-gray-800"
        >
          Visualizza il forecasting ARIMA
        </label>
      </div>
      <div className="flex items-center">
        <input
          id="default-radio-type-prophet"
          type="radio"
          value=""
          name="default-radio-type-forcasting"
          className="w-4 h-4 accent-green-600"
          onChange={() => {
            changeForcastingType("PROPHET");
          }}
        />
        <label
          htmlFor={"default-radio-type-prophet"}
          className="ml-3 text-md font-medium text-gray-800"
        >
          Visualizza il forecasting PROPHET
        </label>
      </div>
    </div>
  );
}

export default ForecastinTypeControls;
