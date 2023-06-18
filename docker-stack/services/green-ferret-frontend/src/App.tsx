import React from "react";
import "./App.css";
import "./tailwind-output.css";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {HeatmapLayerFactory} from "@vgrid/react-leaflet-heatmap-layer";

const HeatmapLayer = HeatmapLayerFactory<[number, number, number]>()

function App() {

  function generateMap() {
    
    return (
      <MapContainer style={{
        height: "100%"
      }} center={[44.4949, 11.3426]} zoom={13} scrollWheelZoom={false}>
        <HeatmapLayer
            fitBoundsOnLoad
            fitBoundsOnUpdate
            points={[[44.4949, 11.3426, 10.2], [44.4946, 11.3426, 15.2],]}
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
          <div className="w-2/3 h-full bg-red-200 rounded-lg overflow-hidden">{generateMap()}</div>
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
            </div>
          </div>
        </div>
       
      </div>
    </div>
  );
}

export default App;
