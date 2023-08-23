import { DeviceModel } from '@/models/DeviceModel';
import { Actions, StateModel } from '@/models/StateModel';
import React from 'react';
import { BsFillArrowRightCircleFill } from 'react-icons/bs';
import DeviceInfo from './DeviceInfo';

interface Props {
  device: DeviceModel;
  state: StateModel
  dispatch: React.Dispatch<Actions>;
}
const SearchResult = ({ device, state, dispatch }: Props) => {
  return (
	<div>
    <div
      className="m-2 flex w-48 flex-row items-center justify-evenly rounded border-2 bg-gray-100 py-3 hover:cursor-pointer"
      onClick={() => {
        console.log('Clicked on device: ', device.id);
		dispatch({ type: 'SHOW_DEVICE', payload: device.id })
      }}
    >
      <p>{device.id}</p>
      <BsFillArrowRightCircleFill className="h-5 w-5" />
    </div>
	{
	  (state.showDevice === device.id)?(
		<DeviceInfo deviceIn={device} dispatch={dispatch} />
	  ):
	  (
		<div>
		</div>
	  )
	}
	</div>
  );
};

export default SearchResult;
