import React from 'react';
import SearchResult from './SearchResult';

interface Props {
  devices: string[];
}

const SearchResults = ({ devices }: Props) => {
  return (
    <div className="mt-5 flex grow flex-row flex-wrap">
      {devices.sort().map((device) => (
        <SearchResult device={device} key={device} />
      ))}
    </div>
  );
};

export default SearchResults;
