import React from "react";
import "./App.css";
import "./tailwind-output.css";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function App() {
  function generateMap() {
    return (
      <MapContainer style={{
        height: "100%"
      }} center={[51.505, -0.09]} zoom={13} scrollWheelZoom={false}>
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
          <div className="w-1/3 h-full bg-red-200 rounded-lg">
            <div className="flex flex-col h-full p-2 gap-2">
              <h2 className="text-2xl font-bold text-left text-blue-500">Filters</h2>
              <div className="flex items-center mb-4">
                <input id="default-radio-1" type="radio" value="" name="default-radio" className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                  <label htmlFor="default-radio-1" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-600">Default state</label>
              </div>
              <div className="flex items-center">
                <input checked id="default-radio-2" type="radio" value="" name="default-radio" className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                  <label htmlFor="default-radio-2" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-600">Checked state</label>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-bold text-left text-blue-500">Date</h3>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-2">
                      <h4 className="text-lg font-bold text-left text-blue-500">Start</h4>
                      <input type="date" className="w-full h-10 p-2 bg-white rounded-lg shadow-md" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <h4 className="text-lg font-bold text-left text-blue-500">End</h4>
                      <input type="date" className="w-full h-10 p-2 bg-white rounded-lg shadow-md" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
