import React from 'react';
import SearchResult from './SearchResult';
import { Actions, StateModel } from '@/models/StateModel';

interface Props {
  state: StateModel;
  dispatch: React.Dispatch<Actions>;
}

const SearchResults = ({ state, dispatch }: Props) => {
  return (
    <div className="flex grow flex-row flex-wrap mt-5">
      {state.searchText === ''
        ? state.devices
            .sort((a, b) => a.id.localeCompare(b.id))
            .map((device) => (
              <SearchResult
                device={device}
				state={state}
                dispatch={dispatch}
                key={device.id}
              />
            ))
        : state.devices
            .filter((device) =>
              device.id.toLowerCase().includes(state.searchText.toLowerCase()),
            )
            .sort((a, b) => a.id.localeCompare(b.id))
            .map((device) => (
              <SearchResult
                device={device}
				state={state}
                dispatch={dispatch}
                key={device.id}
              />
            ))}
    </div>
  );
};

export default SearchResults;
