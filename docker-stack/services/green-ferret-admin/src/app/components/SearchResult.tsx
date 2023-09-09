import Link from 'next/link';
import { BsFillArrowRightCircleFill } from 'react-icons/bs';

interface Props {
  device: string;
}
const SearchResult = ({ device }: Props) => {
  return (
    <Link
      className="duration-400 flex w-48 flex-row items-center justify-between rounded border-2 bg-gray-100 px-4 py-3 text-slate-600 transition-all ease-in-out hover:cursor-pointer hover:border-green-600 hover:text-green-700 "
      href={`/device/${device}`}
    >
      <p className="grow font-semibold text-slate-800">{device}</p>
      <BsFillArrowRightCircleFill className=" h-5 w-5 self-center" />
    </Link>
  );
};

export default SearchResult;
