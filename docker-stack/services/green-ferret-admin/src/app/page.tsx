'use client';

import { StateModel, StateReducer } from '@/models/StateModel';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';

import React from 'react';
import { generateNewDevice } from '@/models/DeviceModel';

const initialState: StateModel = {
  searchText: '',
  devices: [
    generateNewDevice('A49879286F24'),
    generateNewDevice('A49879286F25'),
    generateNewDevice('A49879286F26'),
    generateNewDevice('A49879286F27'),
    generateNewDevice('A49879286F28'),
  ],
};

export default function Home() {
  const [state, dispatch] = React.useReducer(StateReducer, initialState);

  return (
    <div>
      <SearchBar state={state} dispatch={dispatch} />
      <SearchResults state={state} dispatch={dispatch} />
    </div>
  );
}
