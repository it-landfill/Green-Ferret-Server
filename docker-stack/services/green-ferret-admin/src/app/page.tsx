'use client';

import { StateModel, StateReducer } from '@/models/StateModel';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';

import React from 'react';

const initialState: StateModel = {
  searchText: '',
  devices: [
  ],
  showDevice: "",
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
