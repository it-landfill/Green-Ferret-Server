'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import { BsSearch } from 'react-icons/bs';
import { BiRefresh } from 'react-icons/bi';

interface Props {
  searchText: string;
}

const SearchBar = ({ searchText }: Props) => {
  const input = React.useRef<HTMLInputElement>(null);
  const router = useRouter();

  return (
    <div className="flex flex-row">
      <button
        className="mr-2 flex flex-row rounded-lg bg-green-600 bg-opacity-90 px-5 font-semibold text-white hover:bg-opacity-100 focus:outline-none"
        onClick={() => {
          router.refresh();
        }}
      >
        <div className="flex flex-row self-center">
          <BiRefresh className="mr-2 text-2xl" />
          <p className=" font-medium"> Refresh</p>
        </div>
      </button>
      <form className="grow">
        <div className="relative text-slate-500">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <BsSearch className="h-5 w-5" />
          </div>
          <input
            type="search"
            id="default-search"
            ref={input}
            defaultValue={searchText}
            className="block w-full rounded-lg border border-slate-300 bg-gray-50 p-4 pl-10 text-base text-slate-800 focus:border-green-600 focus:outline-none"
            placeholder="Search for board ID"
          />
          <button
            type="submit"
            className="absolute bottom-2 right-2  rounded-lg bg-green-600 bg-opacity-90 px-4 py-2 font-medium text-white  hover:bg-opacity-100 focus:outline-none"
            onClick={(e) => {
              e.preventDefault();
              console.log(
                'Search button clicked. text: ' + input.current?.value,
              );
              router.push('/?query=' + input.current?.value);
              input.current?.blur();
            }}
          >
            Search
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
