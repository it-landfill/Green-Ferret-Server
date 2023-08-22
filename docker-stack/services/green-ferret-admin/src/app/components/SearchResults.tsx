import React from 'react';
import SearchResult from './SearchResult';
import { Actions, StateModel } from '@/models/StateModel';

interface Props {
  state: StateModel;
  dispatch: React.Dispatch<Actions>;
}

const SearchResults = ({ state, dispatch }: Props) => {
  return (
    <div className="flex grow flex-row flex-wrap border-2 border-red-800">
      {state.searchText === ''
        ? state.devices.map((device) => (
            <SearchResult device={device} key={device.id} />
          ))
        : state.devices
            .filter((device) =>
              device.id.toLowerCase().includes(state.searchText.toLowerCase()),
            )
            .map((device) => <SearchResult device={device} key={device.id} />)}
    </div>
  );
};

export default SearchResults;
