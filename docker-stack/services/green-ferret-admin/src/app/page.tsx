import SearchResults from './components/SearchResults';

import React from 'react';
import SearchBar from './components/SearchBar';

async function getData() {
  const response = await fetch('http://localhost:3000/api/getDeviceIDs');
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return await response.json();
}

export default async function Home() {
  const devices = await getData();

  return (
    <div>
      <SearchBar />
      <SearchResults devices={devices} />
    </div>
  );
}
