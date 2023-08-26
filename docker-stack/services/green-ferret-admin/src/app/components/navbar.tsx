import Link from 'next/link';
import { RiAdminFill } from 'react-icons/ri';

export default function MyNavbar() {

  return (
    <nav className="border-gray-200 bg-white">
      <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between p-4">
        <Link href="/" className="flex items-center">
          <RiAdminFill className="mr-3 h-8 text-2xl " />
          <span className="self-center whitespace-nowrap text-2xl font-semibold ">
            Green-Ferret Admin
          </span>
        </Link>
      </div>
    </nav>
  );
}
