import React from "react";
import "./App.css";
import "./tailwind-output.css";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {HeatmapLayerFactory} from "@vgrid/react-leaflet-heatmap-layer";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import { InfluxAccess } from "./InfluxAccess";
import { parse } from "path";

const HeatmapLayer = HeatmapLayerFactory<[number, number, number]>()

function App() {
  
  // Index of the data points array 
  const [dataPointsIndex, setDataPointsIndex] = React.useState(0);
  // State of the data points index cycle
  const [dataPointsIndexCycleState, setDataPointsIndexCycleState] = React.useState(false);
  let indexCycleFunction: any = null;
  let dataPointsIndexCycle: number = 0;

  // Array with data points for the heatmap (can change over time) 
  const [dataPoints, setDataPoints] = React.useState<InfluxAccess.Measurement[][]>([]);

  // Enum for the heatmap type
  enum HeatmapType {
    TEMPERATURE = "temperature",
    PRESSURE = "pressure",
    HUMIDITY = "humidity",
    ECO2 = "eco2",
    TVOC = "tvoc",
    AQI = "aqi", 
  }

  // State of the heatmap type
  const [heatmapType, setHeatmapType] = React.useState<HeatmapType>(HeatmapType.TEMPERATURE);


  async function getDataServer() {
    // Get data from time slot form 
    const dateStart = (document.getElementById("dateStart") as HTMLInputElement).value;
    const timeStart = (document.getElementById("timeStart") as HTMLInputElement).value;
    const timeSpan = (document.getElementById("timeSpan") as HTMLInputElement).value;

    const parsedSpan: number = parseInt(timeSpan);
    const parsedStartDate = new Date(dateStart+"T"+timeStart);
    parsedStartDate.setMinutes(parsedStartDate.getMinutes()-parsedSpan);
    const parsedEndDate = new Date(dateStart+"T"+timeStart);
    parsedEndDate.setMinutes(parsedEndDate.getMinutes()+parsedSpan);

    const data = await InfluxAccess.getData(parsedStartDate, parsedEndDate);
	
    // Number of frames for the animation
    const nFrames = 20;

    // Time span of each frame (in milliseconds)
    const timeFrame = data[data.length-1].time.getTime() - data[0].time.getTime()
    const frameSpan = timeFrame/nFrames;

    // Aggregate inside different arrays data with the same time
    let dataAggregated: InfluxAccess.Measurement[][] = [];

      let startDate: number = data[0].time.getTime();
    dataAggregated[0] = [data[0]];

    for (let i = 1; i < data.length; i++) {
      //(time-minTime):(maxTime-minTime)=x:maxFrames -> x = (time-minTime)*maxFrames/(maxTime-minTime)
      const index = Math.trunc((data[i].time.getTime() - startDate)*nFrames/timeFrame);

      if (dataAggregated[index] == null) dataAggregated[index] = []
      
      dataAggregated[index].push(data[i]);
	}

	// Merge last element with previous cell
	const last = dataAggregated.pop();
	if (last && last.length > 0) {
		dataAggregated[dataAggregated.length-1].push(last[0]);
	}

    setDataPoints(dataAggregated);
  };

  // Use effect for the data points index cycle (if the state is true, the index will cycle through the data points array)
  React.useEffect(() => {
    if (dataPointsIndexCycleState) {
      indexCycleFunction = setInterval(() => {
        // cycle through the data points index
        if (dataPointsIndexCycle !== dataPoints.length - 1) dataPointsIndexCycle += 1;
        else dataPointsIndexCycle = 0;
        setDataPointsIndex(dataPointsIndexCycle);
      }, 1500);
    } else clearInterval(indexCycleFunction);
    return () => clearInterval(indexCycleFunction);
  }, [dataPointsIndexCycleState]);

  const data = [
    {
      name: 'Page A',
      uv: 4000,
      pv: 2400,
      amt: 2400,
    },
    {
      name: 'Page B',
      uv: 3000,
      pv: 1398,
      amt: 2210,
    },
    {
      name: 'Page C',
      uv: 2000,
      pv: 9800,
      amt: 2290,
    },
    {
      name: 'Page D',
      uv: 2780,
      pv: 3908,
      amt: 2000,
    },
    {
      name: 'Page E',
      uv: 1890,
      pv: 4800,
      amt: 2181,
    },
    {
      name: 'Page F',
      uv: 2390,
      pv: 3800,
      amt: 2500,
    },
    {
      name: 'Page G',
      uv: 3490,
      pv: 4300,
      amt: 2100,
    },
  ];

  // State checkboxes for the line chart
  const [lineChartState, setLineChartState] = React.useState({
    pv: true,
    uv: true,
  });

  // Use effect for the line chart state (if the state changes, the line chart will be updated)
  React.useEffect(() => {
    renderLineChart();
  }, [lineChartState]);

  function renderLineChart() {
    return(
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          
          {lineChartState.pv && <YAxis dataKey="pv" yAxisId="pv" stroke="#8884d8" orientation="left"/>}
          {lineChartState.uv && <YAxis dataKey="uv" yAxisId="uv" stroke="#82ca9d" orientation="left"/>}
          
          <Tooltip />
          <Legend />
          {lineChartState.pv && <Line type="monotone" dataKey="pv" yAxisId="pv" stroke="#8884d8" activeDot={{ r: 6 }}/>}
          {lineChartState.uv && <Line type="monotone" dataKey="uv" yAxisId="uv" stroke="#82ca9d" activeDot={{ r: 6 }}/>}
        </LineChart>
      </ResponsiveContainer>
    );
  };

  function renderLineChartSync(id: [string, string]) {
    return(
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          syncId={id[1]}
          margin={{
            top: 5,
            right: 20,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis dataKey= {id[0]} yAxisId={id[0]} orientation="left"/>
    
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey={id[0]} yAxisId={id[0]} stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="App">
      <div className="flex flex-col h-screen p-2 gap-2">
        <h1 className="text-4xl font-bold text-left text-blue-500">Green Ferrett - Heatmap</h1>
        
        <div className="flex h-1/2 items-center justify-center gap-2">
          <div className="w-4/5 h-full bg-red-200 rounded-lg overflow-hidden">
            <MapContainer style={{
              height: "100%"
            }} center={[45.64651, 12.251473]} zoom={13} scrollWheelZoom={true}>
            { dataPoints != null && dataPoints.length > 0 ?
              <HeatmapLayer
                  points = 
                    {[...
                      // Based on the heatmap selected, filter the data points with null values
                      dataPoints[dataPointsIndex].filter((d : InfluxAccess.Measurement) => {
                        return d[heatmapType] != null;
                      }).map((d : InfluxAccess.Measurement): [number, number, number] => {
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
              /> : null }
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            </MapContainer> 
          </div>
          <div className="w-1/5 h-full rounded-lg">
            <div className="flex flex-col h-full gap-2">
              <div className="flex flex-col gap-2 m-4">
                <h2 className="text-2xl font-bold text-left text-blue-500">Filtro heatmap</h2>
                <div className="flex items-center">
                    <input id="default-radio-1" type="radio" value="" name="default-radio" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500" onChange={() => setHeatmapType(HeatmapType.TEMPERATURE)} checked={heatmapType === HeatmapType.TEMPERATURE}/>
                    <label className="ml-3 text-md font-medium text-gray-900 dark:text-gray-600">Visualizza temperatura </label>
                </div>
                <div className="flex items-center">
                  <input id="default-radio-2" type="radio" value="" name="default-radio" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500" onChange={() => setHeatmapType(HeatmapType.PRESSURE)} checked={heatmapType === HeatmapType.PRESSURE}/>
                    <label className="ml-3 text-md font-medium text-gray-900 dark:text-gray-600">Visualizza pressione</label>
                </div>
                <div className="flex items-center">
                  <input id="default-radio-3" type="radio" value="" name="default-radio" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500" onChange={() => setHeatmapType(HeatmapType.HUMIDITY)} checked={heatmapType === HeatmapType.HUMIDITY}/>
                    <label className="ml-3 text-md font-medium text-gray-900 dark:text-gray-600">Visualizza umidità</label>
                </div>
                <div className="flex items-center">
                  <input id="default-radio-4" type="radio" value="" name="default-radio" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500" onChange={() => setHeatmapType(HeatmapType.ECO2)} checked={heatmapType === HeatmapType.ECO2}/>
                    <label className="ml-3 text-md font-medium text-gray-900 dark:text-gray-600">Visualizza CO2</label>
                </div>
                <div className="flex items-center">
                  <input id="default-radio-5" type="radio" value="" name="default-radio" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500" onChange={() => setHeatmapType(HeatmapType.TVOC)} checked={heatmapType === HeatmapType.TVOC}/>
                    <label className="ml-3 text-md font-medium text-gray-900 dark:text-gray-600">Visualizza TVOC</label>
                </div>
                <div className="flex items-center">
                  <input id="default-radio-6" type="radio" value="" name="default-radio" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500" onChange={() => setHeatmapType(HeatmapType.AQI)} checked={heatmapType === HeatmapType.AQI}/>
                    <label className="ml-3 text-md font-medium text-gray-900 dark:text-gray-600">Visualizza qualità dell'aria</label>
                </div>
              </div>
              <div className="flex flex-col gap-4 m-4">
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-bold text-left text-blue-500">Data ed ora</h3>
                  <input id="dateStart" type="date" className="w-full h-10 p-2 bg-white rounded-lg" />
                  <input id="timeStart" type="time" className="w-full h-10 p-2 bg-white rounded-lg" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-bold text-left text-blue-500">Limite temporale</h3>
                  <input id="timeSpan" type="number" className="w-full h-10 p-2 bg-white rounded-lg" placeholder="Durata in minuti" />
                </div>
              </div>
              <div className="flex flex-col gap-2 m-4">
                <button className="w-full h-10 p-2 bg-blue-500 rounded-lg text-white font-bold" onClick={() => getDataServer()}>Applica</button>
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

        <div className="flex h-1/2 items-center justify-center gap-2 m-4">
          <div className="w-4/5 h-full rounded-lg">
            {renderLineChart()}
          </div>
          <div className="w-1/5 h-full rounded-lg">
            <div className="flex flex-col h-full gap-2">
              <div className="flex flex-col gap-2 m-4">
                <h2 className="text-2xl font-bold text-left text-blue-500">Checkbox chart</h2>
                <div className="flex items-center">
                  { lineChartState.pv ? 
                    (<input checked id="default-checkbox" type="checkbox" value="" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500" onChange={() => setLineChartState({ ...lineChartState, pv: !lineChartState.pv })}/>)
                    : (<input id="default-checkbox" type="checkbox" value="" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500" onChange={() => setLineChartState({ ...lineChartState, pv: !lineChartState.pv })}/>)}
                  <label htmlFor="default-checkbox" className="ml-3 text-md font-medium text-gray-900 dark:text-gray-600">Visualizza la linea 1</label>
                </div>
                <div className="flex items-center">
                  { lineChartState.uv ? 
                    (<input checked id="default-checkbox" type="checkbox" value="" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500" onChange={() => setLineChartState({ ...lineChartState, uv: !lineChartState.uv })}/>)
                    : (<input id="default-checkbox" type="checkbox" value="" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500" onChange={() => setLineChartState({ ...lineChartState, uv: !lineChartState.uv })}/>)}
                  <label htmlFor="default-checkbox" className="ml-3 text-md font-medium text-gray-900 dark:text-gray-600">Visualizza la linea 2</label>
                </div>

              </div> 
            </div>
          </div>
        </div>

      </div>

      <div className="flex flex-col h-screen p-2 gap-2">
        <h1 className="text-4xl font-bold text-left text-blue-500">Green Ferrett - Heatmap</h1>
        <div className="grid grid-cols-2 h-screen p-2 gap-2">
          <div className="items-center justify-center gap-2 m-4">
            <div className="h-3/4 rounded-lg">
              {renderLineChartSync(["uv", "sync"])}
              <p className="text-md font-bold text-left text-blue-500 m-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, eget aliquam nisl nisl sit amet nunc. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, eget aliquam nisl nisl sit amet nunc.</p>
            </div>
          </div>
          <div className="items-center justify-center gap-2 m-4">
            <div className="h-3/4 rounded-lg">
              {renderLineChartSync(["pv", "sync"])}
              <p className="text-md font-bold text-left text-blue-500 m-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, eget aliquam nisl nisl sit amet nunc. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, eget aliquam nisl nisl sit amet nunc.</p>
            </div>
          </div>
          <div className="items-center justify-center gap-2 m-4">
            <div className="h-3/4 rounded-lg">
              {renderLineChartSync(["amt", "sync"])}
              <p className="text-md font-bold text-left text-blue-500 m-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, eget aliquam nisl nisl sit amet nunc. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, eget aliquam nisl nisl sit amet nunc.</p>
            </div>
          </div>
          <div className="items-center justify-center gap-2 m-4">
            <div className="h-3/4 rounded-lg">
              {renderLineChartSync(["pv", "sync"])}
              <p className="text-md font-bold text-left text-blue-500 m-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, eget aliquam nisl nisl sit amet nunc. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, eget aliquam nisl nisl sit amet nunc.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
