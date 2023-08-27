import SearchResults from './components/SearchResults';

import React from 'react';
import SearchBar from './components/SearchBar';

interface Props {
  searchParams: { [key: string]: string | string[] | undefined };
}

async function getData(query: string | undefined) {
  console.log("getData called");
  const response = await fetch('http://localhost:3000/api/getDeviceIDs', {
     cache: "no-store" },
  );
  if (!response.ok) {
    throw new Error(response.statusText);
  }

  let devices = await response.json();
  if (query !== undefined) {
    devices = devices.filter((device: string) => {
      return device.toLowerCase().includes(query.toLowerCase());
    });
  }
  return devices;
}

export default async function Home({ searchParams }: Props) {
  const query = searchParams.query as string | undefined;
  const devices = await getData(query);

  return (
    <div>
      <SearchBar searchText={query ?? ''} />
      <SearchResults devices={devices} />
    </div>
  );
}
