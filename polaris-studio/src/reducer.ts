import {nanoid} from 'nanoid';
import {components} from './components';
import {Action, Layer, PropType, State} from './types';
import {getPropValue, setPropValue, updatePropValue} from './utils';

export const reducer = (prevState: State, action: Action): State => {
  let state = {...prevState};
  console.log({log: 'Reducer recieved an action...', action});

  switch (action.type) {
    case 'ADD_LAYER': {
      const id = nanoid();

      const component = components[action.componentName];
      if (!component) {
        throw new Error(
          `Could not create Polaris component layer. Component "${action.componentName}" not found.`,
        );
      }

      const newLayer: Layer = {
        id,
        viewId: state.selectedViewId,
        parent: action.parent,
        title: 'AutoLayout',
        repeat: 1,
        component: action.componentName,
        props: {},
      };

      state = {
        ...state,
        views: [
          ...state.views.map((view) => {
            if (view.id === state.selectedViewId) {
              return {
                ...view,
                selectedLayerId: id,
              };
            }
            return view;
          }),
        ],
        layers: [...state.layers, newLayer],
      };

      break;
    }

    case 'SELECT_LAYER': {
      state = {
        ...state,
        views: [
          ...state.views.map((view) => {
            if (view.id === state.selectedViewId) {
              return {
                ...view,
                selectedLayerId: action.layerId,
              };
            }
            return view;
          }),
        ],
      };
      break;
    }

    case 'SET_HOVERED_LAYER_ID': {
      state = {
        ...state,
        hoveredLayerId: action.layerId,
      };
      break;
    }

    case 'SET_SELECTED_VIEW_ID': {
      state = {
        ...state,
        selectedViewId: action.viewId,
      };
      break;
    }

    case 'SET_LAYER_REPEAT': {
      state = {
        ...state,
        layers: [
          ...state.layers.map((layer) => {
            if (layer.id === action.layerId) {
              return {
                ...layer,
                repeat: action.repeat,
              };
            }
            return layer;
          }),
        ],
      };
      break;
    }

    case 'SET_PROP': {
      state = {
        ...state,
        layers: [
          ...state.layers.map((layer) => {
            if (layer.id === action.layerId) {
              let propValue = getPropValue(layer, action.propPath);

              if (propValue) {
                propValue = updatePropValue(
                  propValue,
                  action.index,
                  action.value.value[0],
                );
                return {
                  ...layer,
                  props: {
                    ...layer.props,
                    ...setPropValue(layer.props, action.propPath, propValue),
                  },
                };
              } else {
                return {
                  ...layer,
                  props: {
                    ...layer.props,
                    ...setPropValue(layer.props, action.propPath, action.value),
                  },
                };
              }
            }
            return layer;
          }),
        ],
      };
      break;
    }

    case 'SHOW_LAYER_ADDER': {
      state = {
        ...state,
        layerAdderVisibility: action.parent,
      };
      break;
    }

    case 'HIDE_LAYER_ADDER': {
      state = {
        ...state,
        layerAdderVisibility: false,
      };
      break;
    }

    case 'UPDATE_APP_STATE': {
      state = {
        ...state,
        appState: {
          ...state.appState,
          sheets: state.appState.sheets.map((sheet) => {
            if (sheet.id === action.sheetId) {
              return {
                ...sheet,
                columns: sheet.columns.map((column, columnIndex) => {
                  if (columnIndex === action.columnIndex) {
                    return {
                      ...column,
                      rows: column.rows.map((row, rowIndex) => {
                        if (rowIndex === action.rowIndex) {
                          if (action.temporaryState) {
                            return {
                              ...row,
                              temporaryValue: action.value,
                            };
                          } else {
                            return {
                              ...row,
                              value: action.value,
                            };
                          }
                        }
                        return row;
                      }),
                    };
                  }
                  return column;
                }),
              };
            }
            return sheet;
          }),
        },
      };
      break;
    }

    case 'ADD_APP_STATE_SHEET': {
      const rows: {value: string; temporaryValue: string | null}[] = [];

      for (let i = 0; i < 100; i++) {
        rows.push({
          value: '',
          temporaryValue: null,
        });
      }

      const columns: {name: string; rows: typeof rows}[] = [];

      for (let i = 0; i < 10; i++) {
        columns.push({
          name: '',
          rows,
        });
      }

      state = {
        ...state,
        appState: {
          ...state.appState,
          sheets: [
            ...state.appState.sheets,
            {
              id: nanoid(),
              name: 'New state',
              columns,
            },
          ],
        },
      };
      break;
    }
  }

  console.log({log: 'Reducer is returning a new state...', state});

  return state;
};
