interface AnimationControlsProps {
  dataPointsIndex: number;
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
          max="20"
          value={props.dataPointsIndex + 1}
          onChange={(e) => {
            props.setDataPointsIndexCycleState(false);
            props.setDataPointsIndex(parseInt(e.target.value) - 1);
          }}
        />
        <div aria-hidden="true" className="flex justify-between px-1">
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
        </div>
      </fieldset>
    </div>
  );
}

export default AnimationControls;
