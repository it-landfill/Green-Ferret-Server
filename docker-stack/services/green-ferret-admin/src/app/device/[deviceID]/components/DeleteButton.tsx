'use client';

import { deleteDevice } from '@/models/ServerActions';
import { useRouter } from 'next/navigation';

interface Props {
  deviceID: string;
}

const DeleteButton = ({ deviceID }: Props) => {
	const router = useRouter();

  return (
    <button
      className="ml-auto mr-2 flex flex-row rounded-lg bg-red-600 bg-opacity-90 px-5 font-semibold text-white hover:bg-opacity-100 focus:outline-none"
      onClick={() => {
        deleteDevice(deviceID);
		router.push('/');
		router.refresh();
      }}
    >
      <div className="flex flex-row self-center">
        <p className="font-medium"> Delete</p>
      </div>
    </button>
  );
};

export default DeleteButton;
