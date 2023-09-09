import React from "react";
import "./App.css";
import "./tailwind-output.css";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { HeatmapLayerFactory } from "@vgrid/react-leaflet-heatmap-layer";

import { InfluxAccess } from "./utils/InfluxAccess";

import TemporalSelector from "./components/dataPointsControls/DPTemporalSelector";
import HeatmapTypeSelector from "./components/dataPointsControls/DPHeatmapTypeSelector";
import AnimationControls from "./components/dataPointsControls/DPAnimationControls";
import ErrorMessagePopup from "./components/ErrorPopup";
import LineChartsSection from "./components/lineChartsControls/LCLineChartsSection";

const HeatmapLayer = HeatmapLayerFactory<[number, number, number]>();

function App() {
  // Index of the data points array.
  const [dataPointsIndex, setDataPointsIndex] = React.useState(0);
  let dataPointsIndexCycle: number = 0;
  // State of the data points index cycle (if true, the index will cycle through the data points array).
  const [dataPointsIndexCycleState, setDataPointsIndexCycleState] =
    React.useState(false);
  // Variable for the setInterval function (to be able to clear it).
  let indexCycleFunction: any = null;
  // Array with data points (each element is a dictionary with the data of a specific source).
  const [dataPoints, setDataPoints] = React.useState<
    InfluxAccess.Measurement[][]
  >([]);
  
  const [isOpenMeteoData, setIsOpenMeteoData] = React.useState(true);

  // Enum for the selected heatmap type.
  enum HeatmapType {
    TEMPERATURE = "temperature",
    PRESSURE = "pressure",
    HUMIDITY = "humidity",
    ECO2 = "eco2",
    TVOC = "tvoc",
    AQI = "aqi",
  }
  // State of the heatmap type.
  const [heatmapType, setHeatmapType] = React.useState<HeatmapType>(
    HeatmapType.TEMPERATURE
  );

  // State of the error message popup
  const [errorMessageState, setErrorMessageState] = React.useState(false);
  // Variable for title and message of the error message popup
  const [errorMessageTitle, setErrorMessageTitle] = React.useState("Errore");
  const [errorMessageMessage, setErrorMessageMessage] = React.useState(
    "Si è verificato un errore generico, riprovare più tardi!"
  );

  /**********************************************************************************************************/

  /**
   *  Function to get the data from the server and aggregate it in the dataPoints array.
   */
  async function getDataServer(isOpenMeteo: boolean) {
	setIsOpenMeteoData(isOpenMeteo);
    // Get data from time slot form data.
    const dateStart = (document.getElementById("dateStart") as HTMLInputElement)
      .value;
    const timeStart = (document.getElementById("timeStart") as HTMLInputElement)
      .value;
    const timeSpan = (document.getElementById("timeSpan") as HTMLInputElement)
      .value;
    // Check if the data are present (if not, show an error message).
    if (dateStart === "" || timeStart === "" || timeSpan === "") {
      showErrorMessagePopup(
        "Errore - Dati mancanti",
        "Attenzione, inserire tutti i dati richiesti. Se non presenti risulta impossibile effettuare la richiesta al server."
      );
      return;
    }
    // Check if the time span is a number (if not, show an error message).
    if (isNaN(parseInt(timeSpan))) {
      showErrorMessagePopup(
        "Errore - Dati errati",
        "Attenzione, il dato inserito nella finestra temporale non è un numero. Inserire un numero intero."
      );
      return;
    }
    // Parse the data to get the start and end date.
    const parsedSpan: number = parseInt(timeSpan);
    const parsedStartDate = new Date(dateStart + "T" + timeStart);
    parsedStartDate.setMinutes(parsedStartDate.getMinutes() - parsedSpan);
    const parsedEndDate = new Date(dateStart + "T" + timeStart);
    parsedEndDate.setMinutes(parsedEndDate.getMinutes() + parsedSpan);
    // Get data from the server.
    let data: InfluxAccess.Measurement[] = [];
    try {
      data = await InfluxAccess.getData(parsedStartDate, parsedEndDate, isOpenMeteo);
    } catch (error: unknown) {
      let title = "Errore";
      let message = "Si è verificato un errore generico, riprovare più tardi!";
      // Case of error in the connection to the server.
      switch ((error as Error).message) {
        case "unauthorized access":
          title = "Errore - Accesso non autorizzato";
          message =
            "Attenzione, non è stato possibile accedere al database. Riprovare più tardi.";
          break;
        default:
          title = "Errore - Connessione al server";
          message =
            "Si è verificato un errore nella connessione al server. Riprovare più tardi.";
          break;
      }
      showErrorMessagePopup(title, message);
      return;
    }

    // Check if the data are present (if not, show an error message).
    if (data.length === 0) {
      showErrorMessagePopup(
        "Errore - Dati mancanti",
        "Attenzione, non sono presenti dati per il periodo selezionato."
      );
      return;
    }
    // Number of frames to aggregate the data.
    const nFrames = 20;
    // Time span of each frame (in milliseconds).
    const timeFrame =
      data[data.length - 1].time.getTime() - data[0].time.getTime();
    // Aggregate inside different arrays data with the same time frame.
    let dataAggregated: InfluxAccess.Measurement[][] = [];
    // The first element of the array is the first data point of the data array.
    let startDate: number = data[0].time.getTime();
    dataAggregated[0] = [data[0]];
    for (let i = 1; i < data.length; i++) {
      // Calculate the index of the data point in the dataAggregated array.
      // (time-minTime) : (maxTime-minTime) = x : maxFrames -> x = (time-minTime) * maxFrames / (maxTime-minTime)
      const index = Math.trunc(
        ((data[i].time.getTime() - startDate) * nFrames) / timeFrame
      );
      // If the index is not in the array, create a new cell.
      if (dataAggregated[index] == null) dataAggregated[index] = [];
      dataAggregated[index].push(data[i]);
    }
    // Sanitize the data (remove the null/empty array cell)
    dataAggregated = dataAggregated.filter((d) => d != null);
    // Update the data points array.
    setDataPoints(dataAggregated);
  }

  // Use effect for the data points index cycle (if the state is true, the index will cycle through the data points array).
  React.useEffect(() => {
    if (dataPointsIndexCycleState) {
      // Sync the data points index cycle with the data points index.
      dataPointsIndexCycle = dataPointsIndex;
      // Cycle through the data points index every second.
      indexCycleFunction = setInterval(() => {
        if (dataPointsIndexCycle < dataPoints.length - 1)
          dataPointsIndexCycle += 1;
        else dataPointsIndexCycle = 0;
        console.log("dataPointsIndexCycle:", dataPointsIndexCycle);
        console.log("dataPoints:", dataPoints[dataPointsIndexCycle]);
        // Print the data points with the new index.
        setDataPointsIndex(dataPointsIndexCycle);
      }, 500);
    } else clearInterval(indexCycleFunction);
    // Clear the interval when the component is unmounted.
    return () => clearInterval(indexCycleFunction);
  }, [dataPointsIndexCycleState]);

  /**********************************************************************************************************/

  /**
   * Show the error message popup.
   *
   * @param title Title of the popup.
   * @param message Message of the popup.
   */
  function showErrorMessagePopup(title: string, message: string) {
    setErrorMessageTitle(title);
    setErrorMessageMessage(message);
    setErrorMessageState(true);
  }

  /**
   * Hide the error message popup.
   */
  function hideErrorMessagePopup() {
    setErrorMessageState(false);
  }

  /**********************************************************************************************************/

  return (
    <div className="App">
      {/* Set the error popup */}
      {errorMessageState ? (
        <ErrorMessagePopup
          title={errorMessageTitle}
          message={errorMessageMessage}
          hideErrorMessagePopup={hideErrorMessagePopup}
        />
      ) : null}
      {/* First section */}
      <div className="flex flex-col h-screen p-4 gap-4">
        <h1 className="text-4xl font-bold text-left text-green-600">
          Green Ferrett
        </h1>
        <div className="flex flex-row h-full items-center justify-center gap-2">
          <div className="w-4/5 h-full rounded-lg border-2 border-green-600 overflow-hidden">
            <MapContainer
              style={{
                height: "100%",
                zIndex: 0,
              }}
              center={[44.494887, 11.3426163]}
              zoom={13}
              scrollWheelZoom={true}
            >
              {dataPoints != null &&
              dataPoints != undefined &&
              dataPoints.length > 0 &&
              dataPoints[dataPointsIndex] != undefined ? (
                <HeatmapLayer
                  points={dataPoints[dataPointsIndex]
                    .filter(
                      (d: InfluxAccess.Measurement) => d[heatmapType] != null
                    )
                    .map(
                      (
                        d: InfluxAccess.Measurement
                      ): [number, number, number] => {
                        // Based on the heatmap selected, the intensity will be different
                        return [d.latitude, d.longitude, d[heatmapType]];
                      }
                    )}
                  longitudeExtractor={(m) => m[1]}
                  latitudeExtractor={(m) => m[0]}
                  intensityExtractor={(m) => m[2]}
                  radius={30}
                  gradient={{ 0.3: "blue", 0.6: "yellow", 1.0: "orange" }}
                  opacity={0.8}
                  blur={40}
                />
              ) : null}
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            </MapContainer>
          </div>
          <div className="w-1/5">
            <div className="flex flex-col h-full gap-2">
              {/* Time selection */}
              <TemporalSelector getDataServer={getDataServer} />
              {dataPoints.length !== 0 ? (
                <div>
                  <div className="w-2/3 border-t-[1px]  border-green-600 mx-auto"></div>
                  <HeatmapTypeSelector
                    dataPoints={dataPoints}
                    heatmapType={heatmapType}
                    setHeatmapType={setHeatmapType}
                  />
                  <div className="w-2/3 border-t-[1px]  border-green-600 mx-auto"></div>
                  <AnimationControls
                    dataPointsIndex={dataPointsIndex}
                    dataPointsIndexCycleState={dataPointsIndexCycleState}
                    maxNumFrames={dataPoints.length}
                    setDataPointsIndexCycleState={setDataPointsIndexCycleState}
                    setDataPointsIndex={setDataPointsIndex}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      {/* Second section */}
      {dataPoints.length !== 0 ? (
        <LineChartsSection dataPoints={dataPoints} enableForcasting={isOpenMeteoData} />
      ) : null}
    </div>
  );
}

export default App;
