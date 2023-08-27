import Link from 'next/link';
import { BsFillArrowRightCircleFill } from 'react-icons/bs';

interface Props {
  device: string;
}
const SearchResult = ({ device }: Props) => {
  return (
    <Link
      className="m-2 flex w-48 flex-row items-center justify-evenly rounded border-2 bg-gray-100 py-3 hover:cursor-pointer"
      href={`/device/${device}`}
    >
      <p>{device}</p>
      <BsFillArrowRightCircleFill className="h-5 w-5" />
    </Link>
  );
};

export default SearchResult;
