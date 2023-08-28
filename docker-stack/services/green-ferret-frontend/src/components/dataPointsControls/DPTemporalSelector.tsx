interface TemporalSelectorProps {
  getDataServer: any;
}

function TemporalSelector(props: TemporalSelectorProps) {
  return (
    <div className="flex flex-col gap-2 m-4">
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
