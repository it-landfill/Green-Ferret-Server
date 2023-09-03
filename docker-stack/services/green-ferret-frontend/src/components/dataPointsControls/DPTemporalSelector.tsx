import React from "react";

interface TemporalSelectorProps {
  getDataServer: any;
}

function TemporalSelector(props: TemporalSelectorProps) {
  const [isOpenMeteoData, setIsOpenMeteoData] = React.useState(false);

  return (
    <div className="flex flex-col gap-6 m-4">
      <h2 className="text-2xl font-bold text-left text-green-600">
        Selezione temporale
      </h2>
      <div className="flex flex-col gap-2">
        <h4 className="text-lg font-bold text-left text-green-600">
          Data ed ora
        </h4>
        <input
          id="dateStart"
          type="date"
          className="w-full h-10 p-2 rounded-lg border-[1px] border-opacity-20 border-green-600 focus:border-opacity-50 focus:border-green-600 focus:outline-none"
        />
        <input
          id="timeStart"
          type="time"
          className="w-full h-10 p-2 rounded-lg border-[1px] border-opacity-20 border-green-600 focus:border-opacity-50 focus:border-green-600 focus:outline-none"
        />
      </div>
      <div className="flex flex-col gap-2">
        <h4 className="text-lg font-bold text-left text-green-600">
          Finestra temporale
        </h4>
        <input
          id="timeSpan"
          type="number"
          className="w-full h-10 p-2 rounded-lg border-[1px] border-opacity-20 border-green-600 focus:border-opacity-50 focus:border-green-600 focus:outline-none"
          placeholder="Durata in minuti"
        />
      </div>
      <div className="flex flex-col gap-2">
        <h4 className="text-lg font-bold text-left text-green-600">
          Fonte dati
        </h4>
        <label className="flex mx-auto items-center gap-4 cursor-pointer text-xl font-bold">
          {isOpenMeteoData ? (
            <span className="text-lg font-medium text-gray-400">
              Green Ferrett
            </span>
          ) : (
            <span className="text-lg font-medium text-gray-700">
              Green Ferrett
            </span>
          )}
          <span className="relative">
            <input
              id="Toggle1"
              type="checkbox"
              className="hidden peer"
              onClick={() => setIsOpenMeteoData(!isOpenMeteoData)}
            ></input>
            <div className="w-12 h-6 rounded-full shadow-inner bg-green-600"></div>
            <div className="absolute inset-y-0 left-0 w-4 h-4 m-1 rounded-full shadow peer-checked:right-0 peer-checked:left-auto bg-white" />
          </span>
          {!isOpenMeteoData ? (
            <span className="text-lg font-medium text-gray-400">
              OpenMeteo Data
            </span>
          ) : (
            <span className="text-lg font-medium text-gray-700">
              OpenMeteo Data
            </span>
          )}
        </label>
      </div>

      <button
        className="w-full h-10 font-bold rounded-lg text-white bg-green-600 bg-opacity-90  hover:bg-opacity-100 focus:outline-none"
        onClick={() => props.getDataServer()}
      >
        Applica
      </button>
    </div>
  );
}

export default TemporalSelector;
