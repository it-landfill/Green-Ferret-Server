import React from "react";
import "./App.css";
import "./tailwind-output.css";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { HeatmapLayerFactory } from "@vgrid/react-leaflet-heatmap-layer";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import { InfluxAccess } from "./InfluxAccess";
import { parse } from "path";

const HeatmapLayer = HeatmapLayerFactory<[number, number, number]>()

function App() {

  // Index of the data points array.
  const [dataPointsIndex, setDataPointsIndex] = React.useState(0);
  let dataPointsIndexCycle: number = 0;
  // State of the data points index cycle (if true, the index will cycle through the data points array).
  const [dataPointsIndexCycleState, setDataPointsIndexCycleState] = React.useState(false);
  // Variable for the setInterval function (to be able to clear it).
  let indexCycleFunction: any = null;
  // Array with data points (each element is a dictionary with the data of a specific source).
  const [dataPoints, setDataPoints] = React.useState<InfluxAccess.Measurement[][]>([]);
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
  const [heatmapType, setHeatmapType] = React.useState<HeatmapType>(HeatmapType.TEMPERATURE);

  /**
   *  Function to get the data from the server and aggregate it in the dataPoints array.
   */
  async function getDataServer() {
    // Get data from time slot form data.
    const dateStart = (document.getElementById("dateStart") as HTMLInputElement).value;
    const timeStart = (document.getElementById("timeStart") as HTMLInputElement).value;
    const timeSpan = (document.getElementById("timeSpan") as HTMLInputElement).value;
    // Parse the data to get the start and end date.
    const parsedSpan: number = parseInt(timeSpan);
    const parsedStartDate = new Date(dateStart + "T" + timeStart);
    parsedStartDate.setMinutes(parsedStartDate.getMinutes() - parsedSpan);
    const parsedEndDate = new Date(dateStart + "T" + timeStart);
    parsedEndDate.setMinutes(parsedEndDate.getMinutes() + parsedSpan);
    // Get data from the server.
    const data = await InfluxAccess.getData(parsedStartDate, parsedEndDate);
    // Number of frames to aggregate the data.
    const nFrames = 20;
    // Time span of each frame (in milliseconds).
    const timeFrame = data[data.length - 1].time.getTime() - data[0].time.getTime();
    // Aggregate inside different arrays data with the same time frame.
    let dataAggregated: InfluxAccess.Measurement[][] = [];
    // The first element of the array is the first data point of the data array.
    let startDate: number = data[0].time.getTime();
    dataAggregated[0] = [data[0]];
    for (let i = 1; i < data.length; i++) {
      // Calculate the index of the data point in the dataAggregated array.
      // (time-minTime) : (maxTime-minTime) = x : maxFrames -> x = (time-minTime) * maxFrames / (maxTime-minTime)
      const index = Math.trunc((data[i].time.getTime() - startDate) * nFrames / timeFrame);
      // If the index is not in the array, create a new cell.
      if (dataAggregated[index] == null) dataAggregated[index] = []
      dataAggregated[index].push(data[i]);
    }
    // Merge last element with previous cell.
    const last = dataAggregated.pop();
    if (last && last.length > 0) dataAggregated[dataAggregated.length - 1].push(last[0]);
    // Update the data points array.
    setDataPoints(dataAggregated);
  };

  // Use effect for the data points index cycle (if the state is true, the index will cycle through the data points array).
  React.useEffect(() => {
    if (dataPointsIndexCycleState) {
      // Cycle through the data points index every second.
      indexCycleFunction =
        setInterval(() => {
          if (dataPointsIndexCycle !== dataPoints.length - 1) dataPointsIndexCycle += 1;
          else dataPointsIndexCycle = 0;
          setDataPointsIndex(dataPointsIndexCycle);
        }, 1000);
    } else clearInterval(indexCycleFunction);
    // Clear the interval when the component is unmounted.
    return () => clearInterval(indexCycleFunction);
  }, [dataPointsIndexCycleState]);

  /**********************************************************************************************************/

  // State of the data points for the line chart.
  const [dataPointsLineChart, setDataPointsLineChart] = React.useState<InfluxAccess.Measurement[]>([]);
  // State checkboxes for the line chart (true if the checkbox is checked).
  const [lineChartState, setLineChartState] = React.useState({
    temperature: true,
    pressure: true,
    humidity: true,
    eco: true,
    tvoc: true,
    aqi: true,
  });
  // State checkboxes for the bar chart
  const [barChartState, setBarChartState] = React.useState(true);

  /**
   * Change the data points structure to be able to use it in the line chart (each data point is a dictionary).
   * 
   * @param dataPoints Array of data points.
   */
  function flattenDataPoints(dataPoints: InfluxAccess.Measurement[][]) {
    // Flatten the data points array.
    let flattenedDataPoints: InfluxAccess.Measurement[] = [];
    // For each data point, add it to the flattened array.
    dataPoints.forEach((dataPoint) => {
      dataPoint.forEach((measurement) => {
        flattenedDataPoints.push(measurement);
      });
    });
    // Update the data points state.
    setDataPointsLineChart(flattenedDataPoints);
  }

  /**
   * Change the data points structure to be able to use it in the line chart (each data point is a dictionary 
   * with the mean of the data points of the same time frame).
   * 
   * @param dataPoints Array of data points.
   */
  function meanDataPoints(dataPoints: InfluxAccess.Measurement[][]) {
    // Flatten the data points array.
    let meanDataPoints: InfluxAccess.Measurement[] = [];
    // For each data point, add it to the flattened array.
    dataPoints.forEach((dataPoint) => {
      // Calculate the mean of the data points.
      let meanMeasurement: InfluxAccess.Measurement = {
        latitude: 0,
        longitude: 0,
        time: dataPoint[0].time,
        temperature: 0,
        pressure: 0,
        humidity: 0,
        eco2: 0,
        tvoc: 0,
        aqi: 0,
      };
      dataPoint.forEach((measurement) => {
        meanMeasurement.temperature += measurement.temperature;
        meanMeasurement.pressure += measurement.pressure;
        meanMeasurement.humidity += measurement.humidity;
        meanMeasurement.eco2 += measurement.eco2;
        meanMeasurement.tvoc += measurement.tvoc;
        meanMeasurement.aqi += measurement.aqi;
      });
      meanMeasurement.temperature /= dataPoint.length;
      meanMeasurement.pressure /= dataPoint.length;
      meanMeasurement.humidity /= dataPoint.length;
      meanMeasurement.eco2 /= dataPoint.length;
      meanMeasurement.tvoc /= dataPoint.length;
      meanMeasurement.aqi /= dataPoint.length;
      meanDataPoints.push(meanMeasurement);
    });
    // Update the data points state.
    setDataPointsLineChart(meanDataPoints);
  }

  // Use effect for the line chart state (if the state changes, the line chart will be updated)
  React.useEffect(() => {
    // flattenDataPoints(dataPoints);
    meanDataPoints(dataPoints);
    renderLineChart();
  }, [lineChartState]);

  function renderLineChart() {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={dataPointsLineChart}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" tick={{ fontSize: 12 }} dy={10} />

          {lineChartState.temperature && <YAxis dataKey="temperature" yAxisId="temperature" stroke="#8884d8" orientation="left" tick={{ fontSize: 12 }} />}
          {lineChartState.pressure && <YAxis dataKey="pressure" yAxisId="pressure" stroke="#82ca9d" orientation="left" tick={{ fontSize: 12 }} />}
          {lineChartState.humidity && <YAxis dataKey="humidity" yAxisId="humidity" stroke="#CA829D" orientation="left" tick={{ fontSize: 12 }} />}
          {lineChartState.eco && <YAxis dataKey="eco" yAxisId="eco" stroke="#9D82CA" orientation="right" tick={{ fontSize: 12 }} />}
          {lineChartState.tvoc && <YAxis dataKey="tvoc" yAxisId="tvoc" stroke="#CA9D82" orientation="right" tick={{ fontSize: 12 }} />}
          {lineChartState.aqi && <YAxis dataKey="aqi" yAxisId="aqi" stroke="#6342FC" orientation="right" tick={{ fontSize: 12 }} />}

          <Tooltip />
          <Legend />
          {lineChartState.temperature && <Line type="monotone" dataKey="temperature" yAxisId="temperature" stroke="#8884d8" activeDot={{ r: 6 }} />}
          {lineChartState.pressure && <Line type="monotone" dataKey="pressure" yAxisId="pressure" stroke="#82ca9d" activeDot={{ r: 6 }} />}
          {lineChartState.humidity && <Line type="monotone" dataKey="humidity" yAxisId="humidity" stroke="#CA829D" activeDot={{ r: 6 }} />}
          {lineChartState.eco && <Line type="monotone" dataKey="eco" yAxisId="eco" stroke="#9D82CA" activeDot={{ r: 6 }} />}
          {lineChartState.tvoc && <Line type="monotone" dataKey="tvoc" yAxisId="tvoc" stroke="#CA9D82" activeDot={{ r: 6 }} />}
          {lineChartState.aqi && <Line type="monotone" dataKey="aqi" yAxisId="aqi" stroke="#6342FC" activeDot={{ r: 6 }} />}
        </LineChart>
      </ResponsiveContainer>
    );
  };

  function renderLineChartSync(id: [string, string]) {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={dataPointsLineChart}
          syncId={id[1]}
          margin={{
            top: 5,
            right: 20,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis dataKey={id[0]} yAxisId={id[0]} orientation="left" />

          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey={id[0]} yAxisId={id[0]} stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    );
  };



  return (
    <div className="App">
      {/* First section */}
      <div className="flex flex-col h-screen p-4 gap-4">
        <h1 className="text-4xl font-bold text-left text-green-600">Green Ferrett</h1>
        <div className="flex flex-row h-full items-center justify-center gap-2">
          <div className="w-4/5 h-full rounded-lg border-2 border-green-600 overflow-hidden">
            <MapContainer style={{
              height: "100%",
            }} center={[45.64651, 12.251473]} zoom={13} scrollWheelZoom={true}>
              {dataPoints != null && dataPoints.length > 0 ?
                <HeatmapLayer
                  points=
                  {[...
                    // Based on the heatmap selected, filter the data points with null values
                    dataPoints[dataPointsIndex].filter((d: InfluxAccess.Measurement) => {
                      return d[heatmapType] != null;
                    }).map((d: InfluxAccess.Measurement): [number, number, number] => {
                      // Based on the heatmap selected, the intensity will be different
                      return ([d.latitude, d.longitude, d[heatmapType]]);
                    })
                  ]}
                  longitudeExtractor={m => m[1]}
                  latitudeExtractor={m => m[0]}
                  intensityExtractor={m => m[2]}
                  radius={30}
                  gradient={{ 0.2: 'blue', 0.7: 'yellow', 1.0: 'orange' }}
                  opacity={0.8}
                /> : null}
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            </MapContainer>
          </div>
          <div className="w-1/5">
            <div className="flex flex-col h-full gap-2">
              {/* Time selection */}
              <div className="flex flex-col gap-2 m-4">
                <h2 className="text-2xl font-bold text-left text-green-600">Selezione temporale</h2>
                <div className="flex flex-col gap-2">
                  <h4 className="text-lg font-bold text-left text-green-600">Data ed ora</h4>
                  <input id="dateStart" type="date" className="w-full h-10 p-2 rounded-lg border-[1px] border-opacity-20 border-green-600 focus:border-opacity-50 focus:border-green-600 focus:outline-none" />
                  <input id="timeStart" type="time" className="w-full h-10 p-2 rounded-lg border-[1px] border-opacity-20 border-green-600 focus:border-opacity-50 focus:border-green-600 focus:outline-none" />
                </div>
                <div className="flex flex-col gap-2">
                  <h4 className="text-lg font-bold text-left text-green-600">Finestra temporale</h4>
                  <input id="timeSpan" type="number" className="w-full h-10 p-2 rounded-lg border-[1px] border-opacity-20 border-green-600 focus:border-opacity-50 focus:border-green-600 focus:outline-none" placeholder="Durata in minuti" />
                </div>
                <button className="w-full h-10 font-bold rounded-lg text-white bg-green-600 bg-opacity-90  hover:bg-opacity-100 focus:outline-none" onClick={() => getDataServer()}>Applica</button>
              </div>
              <div className="w-2/3 border-t-[1px]  border-green-600 mx-auto"></div>
              {/* Heatmap filter */}
              <div className="flex flex-col gap-2 m-4">
                <h2 className="text-2xl font-bold text-left text-green-600">Filtro heatmap</h2>
                <div className="flex items-center">
                  <input id="default-radio-1" type="radio" value="" name="default-radio" className="w-4 h-4 accent-green-600" onChange={() => setHeatmapType(HeatmapType.TEMPERATURE)} checked={heatmapType === HeatmapType.TEMPERATURE} />
                  <label className="ml-3 text-md font-medium text-gray-800">Visualizza temperatura </label>
                </div>
                <div className="flex items-center">
                  <input id="default-radio-2" type="radio" value="" name="default-radio" className="w-4 h-4 accent-green-600" onChange={() => setHeatmapType(HeatmapType.PRESSURE)} checked={heatmapType === HeatmapType.PRESSURE} />
                  <label className="ml-3 text-md font-medium text-gray-800">Visualizza pressione</label>
                </div>
                <div className="flex items-center">
                  <input id="default-radio-3" type="radio" value="" name="default-radio" className="w-4 h-4 accent-green-600" onChange={() => setHeatmapType(HeatmapType.HUMIDITY)} checked={heatmapType === HeatmapType.HUMIDITY} />
                  <label className="ml-3 text-md font-medium text-gray-800">Visualizza umidità</label>
                </div>
                <div className="flex items-center">
                  <input id="default-radio-4" type="radio" value="" name="default-radio" className="w-4 h-4 accent-green-600" onChange={() => setHeatmapType(HeatmapType.ECO2)} checked={heatmapType === HeatmapType.ECO2} />
                  <label className="ml-3 text-md font-medium text-gray-800">Visualizza CO2</label>
                </div>
                <div className="flex items-center">
                  <input id="default-radio-5" type="radio" value="" name="default-radio" className="w-4 h-4 accent-green-600" onChange={() => setHeatmapType(HeatmapType.TVOC)} checked={heatmapType === HeatmapType.TVOC} />
                  <label className="ml-3 text-md font-medium text-gray-800">Visualizza TVOC</label>
                </div>
                <div className="flex items-center">
                  <input id="default-radio-6" type="radio" value="" name="default-radio" className="w-4 h-4 accent-green-600" onChange={() => setHeatmapType(HeatmapType.AQI)} checked={heatmapType === HeatmapType.AQI} />
                  <label className="ml-3 text-md font-medium text-gray-800">Visualizza qualità dell'aria</label>
                </div>
              </div>
              <div className="w-2/3 border-t-[1px]  border-green-600 mx-auto"></div>
              {/* Data points control */}
              <div className="flex flex-col gap-2 m-4">
                <h2 className="text-2xl font-bold text-left text-green-600">Controlli Start/Stop</h2>
                <div className="flex items-center gap-2 m-4">
                  {!dataPointsIndexCycleState
                    ? <button className="w-full h-10 font-bold rounded-lg text-white bg-green-600 bg-opacity-90 hover:bg-opacity-100 ease-in-out duration-300" onClick={() => setDataPointsIndexCycleState(true)}>Start</button>
                    : <button className="w-full h-10 font-bold rounded-lg text-white bg-red-600 bg-opacity-90 hover:bg-opacity-100 ease-in-out duration-300" onClick={() => setDataPointsIndexCycleState(false)}>Stop</button>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Second section */}
      <div className="flex flex-col p-4 gap-4 text-green-600">
        <h1 className="text-4xl font-bold text-left">Green Ferrett</h1>
        {/* Button switch chart visualization */}
        <label className="flex mx-auto items-center gap-4 cursor-pointer text-xl font-bold">
          {
            barChartState ?
              <span>Visualizzazione compatta</span>
              : <span className="text-slate-400">Visualizzazione compatta</span>
          }
          <span className="relative">
            <input id="Toggle1" type="checkbox" className="hidden peer" onClick={() => setBarChartState(!barChartState)} />
            <div className="w-12 h-6 rounded-full shadow-inner bg-green-600"></div>
            <div className="absolute inset-y-0 left-0 w-4 h-4 m-1 rounded-full shadow peer-checked:right-0 peer-checked:left-auto bg-white"></div>
          </span>
          {
            !barChartState ?
              <span>Visualizzazione estesa</span>
              : <span className="text-slate-400">Visualizzazione estesa</span>
          }
        </label>
        {/* Chart */}
        {
          barChartState ?
            <div className="flex flex-row h-full items-center justify-center gap-2">
              {/* Line chart */}
              <div className="w-5/6 m-4 aspect-[6/3]">
                {renderLineChart()}
              </div>
              <div className="w-1/6 h-full">
                {/* Checkbox chart */}
                <div className="flex flex-col h-full gap-2 m-4">
                  <h2 className="text-2xl font-bold text-left text-green-600">Filtro grafico</h2>
                  <div className="flex items-center">
                    {lineChartState.temperature ?
                      (<input checked id="default-checkbox" type="checkbox" className="w-4 h-4 bg-gray-100 border-gray-300 accent-green-600" onChange={() => setLineChartState({ ...lineChartState, temperature: !lineChartState.temperature })} />)
                      : (<input id="default-checkbox" type="checkbox" className="w-4 h-4 bg-gray-100 border-gray-300" onChange={() => setLineChartState({ ...lineChartState, temperature: !lineChartState.temperature })} />)}
                    <label htmlFor="default-checkbox" className="ml-3 text-md font-medium text-gray-900 dark:text-gray-600">Visualizza temperatura</label>
                  </div>
                  <div className="flex items-center">
                    {lineChartState.pressure ?
                      (<input checked id="default-checkbox" type="checkbox" className="w-4 h-4 bg-gray-100 border-gray-300 accent-green-600" onChange={() => setLineChartState({ ...lineChartState, pressure: !lineChartState.pressure })} />)
                      : (<input id="default-checkbox" type="checkbox" className="w-4 h-4 bg-gray-100 border-gray-300" onChange={() => setLineChartState({ ...lineChartState, pressure: !lineChartState.pressure })} />)}
                    <label htmlFor="default-checkbox" className="ml-3 text-md font-medium text-gray-900 dark:text-gray-600">Visualizza pressione</label>
                  </div>
                  <div className="flex items-center">
                    {lineChartState.humidity ?
                      (<input checked id="default-checkbox" type="checkbox" className="w-4 h-4 bg-gray-100 border-gray-300 accent-green-600" onChange={() => setLineChartState({ ...lineChartState, humidity: !lineChartState.humidity })} />)
                      : (<input id="default-checkbox" type="checkbox" className="w-4 h-4 bg-gray-100 border-gray-300" onChange={() => setLineChartState({ ...lineChartState, humidity: !lineChartState.humidity })} />)}
                    <label htmlFor="default-checkbox" className="ml-3 text-md font-medium text-gray-900 dark:text-gray-600">Visualizza umidità</label>
                  </div>
                  <div className="flex items-center">
                    {lineChartState.eco ?
                      (<input checked id="default-checkbox" type="checkbox" className="w-4 h-4 bg-gray-100 border-gray-300 accent-green-600" onChange={() => setLineChartState({ ...lineChartState, eco: !lineChartState.eco })} />)
                      : (<input id="default-checkbox" type="checkbox" className="w-4 h-4 bg-gray-100 border-gray-300" onChange={() => setLineChartState({ ...lineChartState, eco: !lineChartState.eco })} />)}
                    <label htmlFor="default-checkbox" className="ml-3 text-md font-medium text-gray-900 dark:text-gray-600">Visualizza CO2</label>
                  </div>
                  <div className="flex items-center">
                    {lineChartState.tvoc ?
                      (<input checked id="default-checkbox" type="checkbox" className="w-4 h-4 bg-gray-100 border-gray-300 accent-green-600" onChange={() => setLineChartState({ ...lineChartState, tvoc: !lineChartState.tvoc })} />)
                      : (<input id="default-checkbox" type="checkbox" className="w-4 h-4 bg-gray-100 border-gray-300" onChange={() => setLineChartState({ ...lineChartState, tvoc: !lineChartState.tvoc })} />)}
                    <label htmlFor="default-checkbox" className="ml-3 text-md font-medium text-gray-900 dark:text-gray-600">Visualizza TVOC</label>
                  </div>
                  <div className="flex items-center">
                    {lineChartState.aqi ?
                      (<input checked id="default-checkbox" type="checkbox" className="w-4 h-4 bg-gray-100 border-gray-300 accent-green-600" onChange={() => setLineChartState({ ...lineChartState, aqi: !lineChartState.aqi })} />)
                      : (<input id="default-checkbox" type="checkbox" className="w-4 h-4 bg-gray-100 border-gray-300" onChange={() => setLineChartState({ ...lineChartState, aqi: !lineChartState.aqi })} />)}
                    <label htmlFor="default-checkbox" className="ml-3 text-md font-medium text-gray-900 dark:text-gray-600">Visualizza qualità dell'aria</label>
                  </div>
                </div>
              </div>
            </div>
            :
            <div className="flex flex-row h-full items-center justify-center gap-2">
              <div className="w-5/6 h-full">
                <div className="grid grid-cols-2 h-screen p-2 gap-2">
                  <div className="m-4 aspect-[6/3]">
                    {renderLineChartSync(["temperature", "sync"])}
                  </div>
                  <div className="m-4 aspect-[6/3]">
                    {renderLineChartSync(["pressure", "sync"])}
                  </div>
                  <div className="m-4 aspect-[6/3]">
                    {renderLineChartSync(["humidity", "sync"])}
                  </div>
                  <div className="m-4 aspect-[6/3]">
                    {renderLineChartSync(["eco", "sync"])}
                  </div>
                  <div className="m-4 aspect-[6/3]">
                    {renderLineChartSync(["tvoc", "sync"])}
                  </div>
                  <div className="m-4 aspect-[6/3]">
                    {renderLineChartSync(["aqi", "sync"])}
                  </div>
                </div>
              </div>
              <div className="w-1/6 h-full">
                {/* Checkbox chart 
                <div className="flex flex-col h-full gap-2 m-4">
                  <h2 className="text-2xl font-bold text-left text-green-600">Filtro grafico</h2>
                  <div className="flex items-center">
                    {lineChartState.pv ?
                      (<input checked id="default-checkbox" type="checkbox" value="" className="w-4 h-4 bg-gray-100 border-gray-300 accent-green-600" onChange={() => setLineChartState({ ...lineChartState, pv: !lineChartState.pv })} />)
                      : (<input id="default-checkbox" type="checkbox" value="" className="w-4 h-4 bg-gray-100 border-gray-300" onChange={() => setLineChartState({ ...lineChartState, pv: !lineChartState.pv })} />)}
                    <label htmlFor="default-checkbox" className="ml-3 text-md font-medium text-gray-900 dark:text-gray-600">Visualizza la linea 1</label>
                  </div>
                  <div className="flex items-center">
                    {lineChartState.uv ?
                      (<input checked id="default-checkbox" type="checkbox" value="" className="w-4 h-4 bg-gray-100 border-gray-300 accent-green-600" onChange={() => setLineChartState({ ...lineChartState, uv: !lineChartState.uv })} />)
                      : (<input id="default-checkbox" type="checkbox" value="" className="w-4 h-4 bg-gray-100 border-gray-300" onChange={() => setLineChartState({ ...lineChartState, uv: !lineChartState.uv })} />)}
                    <label htmlFor="default-checkbox" className="ml-3 text-md font-medium text-gray-900 dark:text-gray-600">Visualizza la linea 1</label>
                  </div>
                  <div className="flex items-center">
                    {lineChartState.uv ?
                      (<input checked id="default-checkbox" type="checkbox" value="" className="w-4 h-4 bg-gray-100 border-gray-300 accent-green-600" onChange={() => setLineChartState({ ...lineChartState, uv: !lineChartState.uv })} />)
                      : (<input id="default-checkbox" type="checkbox" value="" className="w-4 h-4 bg-gray-100 border-gray-300" onChange={() => setLineChartState({ ...lineChartState, uv: !lineChartState.uv })} />)}
                    <label htmlFor="default-checkbox" className="ml-3 text-md font-medium text-gray-900 dark:text-gray-600">Visualizza la linea 1</label>
                  </div>
                  <div className="flex items-center">
                    {lineChartState.uv ?
                      (<input checked id="default-checkbox" type="checkbox" value="" className="w-4 h-4 bg-gray-100 border-gray-300 accent-green-600" onChange={() => setLineChartState({ ...lineChartState, uv: !lineChartState.uv })} />)
                      : (<input id="default-checkbox" type="checkbox" value="" className="w-4 h-4 bg-gray-100 border-gray-300" onChange={() => setLineChartState({ ...lineChartState, uv: !lineChartState.uv })} />)}
                    <label htmlFor="default-checkbox" className="ml-3 text-md font-medium text-gray-900 dark:text-gray-600">Visualizza la linea 1</label>
                  </div>
                  <div className="flex items-center">
                    {lineChartState.uv ?
                      (<input checked id="default-checkbox" type="checkbox" value="" className="w-4 h-4 bg-gray-100 border-gray-300 accent-green-600" onChange={() => setLineChartState({ ...lineChartState, uv: !lineChartState.uv })} />)
                      : (<input id="default-checkbox" type="checkbox" value="" className="w-4 h-4 bg-gray-100 border-gray-300" onChange={() => setLineChartState({ ...lineChartState, uv: !lineChartState.uv })} />)}
                    <label htmlFor="default-checkbox" className="ml-3 text-md font-medium text-gray-900 dark:text-gray-600">Visualizza la linea 1</label>
                  </div>
                  <div className="flex items-center">
                    {lineChartState.uv ?
                      (<input checked id="default-checkbox" type="checkbox" value="" className="w-4 h-4 bg-gray-100 border-gray-300 accent-green-600" onChange={() => setLineChartState({ ...lineChartState, uv: !lineChartState.uv })} />)
                      : (<input id="default-checkbox" type="checkbox" value="" className="w-4 h-4 bg-gray-100 border-gray-300" onChange={() => setLineChartState({ ...lineChartState, uv: !lineChartState.uv })} />)}
                    <label htmlFor="default-checkbox" className="ml-3 text-md font-medium text-gray-900 dark:text-gray-600">Visualizza la linea 1</label>
                  </div>
                </div>*/}
              </div>
            </div>
        }
      </div>
    </div>
  );
}

export default App;
