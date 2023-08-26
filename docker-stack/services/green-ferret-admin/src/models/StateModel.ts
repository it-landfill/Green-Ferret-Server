import { DeviceModel } from './DeviceModel';

export interface StateModel {
  searchText: string;
  devices: DeviceModel[];
  showDevice: string;
}

export type Actions =
  | {
      type: 'SEARCH';
      payload: string;
    }
  | {
      type: 'SHOW_DEVICE';
      payload: string;
    }
  | {
      type: 'CLOSE_DEVICE';
    }
  | {
      type: 'SAVE_DEVICE';
      payload: DeviceModel;
    };

export const StateReducer = (
  state: StateModel,
  action: Actions,
): StateModel => {
  switch (action.type) {
    case 'SEARCH':
      console.log('Searching ' + action.payload);
      return {
        ...state,
        searchText: action.payload,
      };
    case 'SHOW_DEVICE':
      console.log('Showing ' + JSON.stringify(action.payload));
      return {
        ...state,
        showDevice: action.payload,
      };
    case 'CLOSE_DEVICE':
      console.log('Closing device');
      return {
        ...state,
        showDevice: "",
      };
    case 'SAVE_DEVICE':
		console.log('Saving device ' + JSON.stringify(action.payload));
       return {
        ...state,
        devices: state.devices
          .filter((dev) => dev.id !== action.payload?.id)
          .concat(action.payload),
      };
    default:
      throw new Error("Action type doesn't exist");
  }
};
