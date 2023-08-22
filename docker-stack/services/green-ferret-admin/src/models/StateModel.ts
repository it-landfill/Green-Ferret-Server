import { DeviceModel } from './DeviceModel';

export interface StateModel {
  searchText: string;
  devices: DeviceModel[];
}

export type Actions =
  | {
      type: 'UPDATE_CONFIG';
      payload: {
        deviceModel: DeviceModel;
      };
    }
  | {
      type: 'SEARCH';
      payload: string;
    };

export const StateReducer = (
  state: StateModel,
  action: Actions,
): StateModel => {
  switch (action.type) {
    case 'UPDATE_CONFIG':
      console.log(
        'UPDATE_CONFIG ' + JSON.stringify(action.payload.deviceModel),
      );
      return {
        ...state,
        devices: state.devices
          .filter((dev) => {
            dev.id !== action.payload.deviceModel.id;
          })
          .concat(action.payload.deviceModel),
      };
    case 'SEARCH':
      console.log('Searching ' + action.payload);
      return {
        ...state,
        searchText: action.payload,
      };
    default:
      throw new Error("Action type doesn't exist");
  }
};
