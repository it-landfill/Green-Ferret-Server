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
        className="mr-2 flex flex-row rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-900"
        onClick={() => {
          router.refresh();
        }}
      >
        <BiRefresh className="mr-2 text-xl" />
        <p className="font-medium"> Refresh</p>
      </button>
      <form className="grow">
        <label
          htmlFor="default-search"
          className="sr-only mb-2 text-sm font-medium text-gray-900"
        >
          Search
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <BsSearch className="h-4 w-4 text-gray-500 " />
          </div>
          <input
            type="search"
            id="default-search"
            ref={input}
            defaultValue={searchText}
            className="block w-full  rounded-lg border border-gray-300 bg-gray-50 p-4 pl-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            placeholder="Search for board ID"
          />
          <button
            type="submit"
            className="absolute bottom-2.5 right-2.5 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
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
