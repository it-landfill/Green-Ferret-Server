import React from "react";
import "./App.css";
import "./tailwind-output.css";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {HeatmapLayerFactory} from "@vgrid/react-leaflet-heatmap-layer";

const HeatmapLayer = HeatmapLayerFactory<[number, number, number]>()

function App() {
  
  // Index of the data points array 
  const [dataPointsIndex, setDataPointsIndex] = React.useState(0);
  // State of the data points index cycle
  const [dataPointsIndexCycleState, setDataPointsIndexCycleState] = React.useState(false);
  let indexCycleFunction: any = null;
  let dataPointsIndexCycle: number = 0;

  // Array with data points for the heatmap (can change over time) 
  var dataPoints : [number, number, number][] = [
    [44.4949, 11.3423, 0.5],
    [44.4949, 11.3424, 0.6],
    [44.4949, 11.3425, 0.7],
    [44.4949, 11.3426, 0.8]];

  // Use effect for the data points index cycle (if the state is true, the index will cycle through the data points array)
  React.useEffect(() => {
    if (dataPointsIndexCycleState) {
      indexCycleFunction = setInterval(() => {
        // cycle through the data points index
        if (dataPointsIndexCycle !== dataPoints.length - 1) dataPointsIndexCycle += 1
        else dataPointsIndexCycle = 0;
        setDataPointsIndex(dataPointsIndexCycle);
      }, 1500);
    } else clearInterval(indexCycleFunction);
    return () => clearInterval(indexCycleFunction);
  }, [dataPointsIndexCycleState]);

  // Use effect for the data points index (if the index changes, the data points will be updated)
  React.useEffect(() => {
    console.log("dataPoints: " + dataPoints[dataPointsIndex]);
    generateMap([dataPoints[dataPointsIndex]]);
  }, [dataPointsIndex]);

  // Generate the map
  function generateMap(dataPoint: [number, number, number][]) {
    
    return (
      <MapContainer style={{
        height: "100%"
      }} center={[44.4949, 11.3426]} zoom={13} scrollWheelZoom={false}>
        <HeatmapLayer
            fitBoundsOnLoad
            fitBoundsOnUpdate
            points = {dataPoint}
            longitudeExtractor={m => m[1]}
            latitudeExtractor={m => m[0]}
            intensityExtractor={m => m[2]}
            radius={30}
            gradient={{ 0.2: 'blue', 0.7: 'yellow', 1.0: 'red' }}
            opacity={0.75}
        />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      </MapContainer>
    );
  }



  return (
    <div className="App">
      <div className="flex flex-col h-screen p-2 gap-2">
        <h1 className="text-4xl font-bold text-left text-blue-500">Green Ferrett - Heatmap</h1>
        <div className="flex h-3/4 items-center justify-center gap-2">
          <div className="w-2/3 h-full bg-red-200 rounded-lg overflow-hidden">
            <MapContainer style={{
              height: "100%"
            }} center={[44.4949, 11.3426]} zoom={13} scrollWheelZoom={false}>
              <HeatmapLayer
                  fitBoundsOnLoad
                  fitBoundsOnUpdate
                  points = {[dataPoints[dataPointsIndex]]}
                  longitudeExtractor={m => m[1]}
                  latitudeExtractor={m => m[0]}
                  intensityExtractor={m => m[2]}
                  radius={30}
                  gradient={{ 0.2: 'blue', 0.7: 'yellow', 1.0: 'red' }}
                  opacity={0.75}
              />
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            </MapContainer>
          </div>
          <div className="w-1/3 h-full rounded-lg">
            <div className="flex flex-col h-full gap-2">
              <div className="flex flex-col gap-2 m-4">
                <h2 className="text-2xl font-bold text-left text-blue-500">Filtro heatmap</h2>
                <div className="flex items-center">
                    <input checked id="default-radio-1" type="radio" value="" name="default-radio" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500" />
                    <label htmlFor="default-radio-1" className="ml-3 text-md font-medium text-gray-900 dark:text-gray-600">Visualizza la heatmap 1</label>
                </div>
                <div className="flex items-center">
                  <input checked id="default-radio-2" type="radio" value="" name="default-radio" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500" />
                    <label htmlFor="default-radio-2" className="ml-3 text-md font-medium text-gray-900 dark:text-gray-600">Visualizza la heatmap 2</label>
                </div>
              </div>
              <div className="flex flex-col gap-4 m-4">
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-bold text-left text-blue-500">Data ed ora</h3>
                  <input type="date" className="w-full h-10 p-2 bg-white rounded-lg" />
                  <input type="time" className="w-full h-10 p-2 bg-white rounded-lg" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-bold text-left text-blue-500">Limite temporale</h3>
                  <input type="number" className="w-full h-10 p-2 bg-white rounded-lg" placeholder="Durata in minuti" />
                </div>
              </div>
              <div className="flex flex-col gap-2 m-4">
                <button className="w-full h-10 p-2 bg-blue-500 rounded-lg text-white font-bold">Applica filtro</button>
              </div>
              <div className="flex flex-col gap-2 m-4">
                <h2 className="text-2xl font-bold text-left text-blue-500">Controlli Start/Stop</h2>
                <div className="flex items-center gap-2 m-4">
                  <button className="w-full h-10 p-2 bg-red-500 rounded-lg text-white font-bold" onClick={() => setDataPointsIndexCycleState(true)}>Start</button>
                  <button className="w-full h-10 p-2 bg-red-500 rounded-lg text-white font-bold" onClick={() => setDataPointsIndexCycleState(false)}>Stop</button>
                </div>
                <p className="text-md font-bold text-left text-blue-500">Index Count: <span className="text-green-500">{ dataPointsIndex }</span></p>
              </div>
            </div>
          </div>
        </div>
       
      </div>
    </div>
  );
}

export default App;
