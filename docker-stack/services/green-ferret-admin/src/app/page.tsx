import SearchResults from './components/SearchResults';

import React from 'react';
import { GetServerSideProps, GetServerSidePropsResult } from 'next';
import { dbGetAllDeviceIDs } from '@/models/Postgres';
import SearchBar from './components/SearchBar';

async function getDevices(): Promise<string[]> {
  return dbGetAllDeviceIDs();
}

export default async function Home() {
  const devices = await getDevices();
  return (
    <div>
      <SearchBar />
      <SearchResults devices={devices} />
    </div>
  );
}
