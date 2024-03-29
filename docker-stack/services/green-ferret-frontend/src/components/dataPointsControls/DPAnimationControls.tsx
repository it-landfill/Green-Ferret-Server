interface AnimationControlsProps {
  dataPointsIndex: number;
  maxNumFrames: number;
  dataPointsIndexCycleState: boolean;
  setDataPointsIndexCycleState: any;
  setDataPointsIndex: any;
}



function AnimationControls(props: AnimationControlsProps) {
  return (
    <div className="flex flex-col gap-2 m-4">
      <h2 className="text-2xl font-bold text-left text-green-600">
        Controlli Start/Stop
      </h2>
      <div className="flex items-center gap-2 m-4">
        {!props.dataPointsIndexCycleState ? (
          <button
            className="w-full h-10 font-bold rounded-lg text-white bg-green-600 bg-opacity-90 hover:bg-opacity-100 ease-in-out duration-300"
            onClick={() => props.setDataPointsIndexCycleState(true)}
          >
            Start
          </button>
        ) : (
          <button
            className="w-full h-10 font-bold rounded-lg text-white bg-red-600 bg-opacity-90 hover:bg-opacity-100 ease-in-out duration-300"
            onClick={() => props.setDataPointsIndexCycleState(false)}
          >
            Stop
          </button>
        )}
      </div>
      <fieldset className="mx-auto space-y-1 w-11/12">
        <input
          type="range"
          className="w-full cursor-pointer rounded border-[1px] border-green-700 h-2 accent-green-600 appearance-none"
          min="1"
          max={props.maxNumFrames}
          value={props.dataPointsIndex + 1}
          onChange={(e) => {
            props.setDataPointsIndexCycleState(false);
            console.log(
              "Cambiamento del controller component:",
              e.target.value
            );
            props.setDataPointsIndex(parseInt(e.target.value) - 1);
          }}
        />
        <div aria-hidden="true" className="flex justify-between px-1">
          {
            // Generator for span elements for the slider
            [...Array(props.maxNumFrames)].map((_, i) => (
              <span
                key={i}
                className={`w-1 h-1 text-xs`}
              > {i + 1} </span>
            ))
          }
        </div>
      </fieldset>
    </div>
  );
}

export default AnimationControls;
