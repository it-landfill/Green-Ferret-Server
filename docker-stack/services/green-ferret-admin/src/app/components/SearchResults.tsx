import React from 'react';
import SearchResult from './SearchResult';

interface Props {
  devices: string[];
}

const SearchResults = ({ devices }: Props) => {
  return (
    <div className="my-5 flex grow flex-row flex-wrap justify-items-stretch gap-4">
      {devices.sort().map((device) => (
        <SearchResult device={device} key={device} />
      ))}
    </div>
  );
};

export default SearchResults;
