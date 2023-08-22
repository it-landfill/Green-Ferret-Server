import { DeviceModel } from '@/models/DeviceModel';
import React from 'react';
import { BsFillArrowRightCircleFill } from 'react-icons/bs';

interface Props {
  device: DeviceModel;
}
const SearchResult = ({ device }: Props) => {
  return (
    <div className="m-2 flex w-48 flex-row items-center justify-evenly rounded border-2 bg-gray-100 py-3">
      <p>{device.id}</p>
      <BsFillArrowRightCircleFill className="h-5 w-5" />
    </div>
  );
};

export default SearchResult;
