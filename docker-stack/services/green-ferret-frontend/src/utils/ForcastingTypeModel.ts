interface typeForcastingModel {
  none: boolean;
  ARIMA: boolean;
  PROPHET: boolean;
}

interface targetForcastingModel {
  temperature: boolean;
  humidity: boolean;
  pressure: boolean;
  eco2: boolean;
  tvoc: boolean;
  aqi: boolean;
}

export interface ForcastingTypeModel {
  type: typeForcastingModel;
  target: targetForcastingModel;
}
