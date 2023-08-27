import SearchResults from './components/SearchResults';

import React from 'react';
import SearchBar from './components/SearchBar';
import { getDeviceIDs } from '@/models/ServerActions';

interface Props {
  searchParams: { [key: string]: string | string[] | undefined };
}

async function getData(query: string | undefined) {
  console.log('getData called');

  let devices = await getDeviceIDs();
  console.log('devices', devices);
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
