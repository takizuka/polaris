'use client';

import styles from './Canvas.module.scss';
import '@shopify/polaris/build/esm/styles.css';
import {AppProvider, Frame} from '@shopify/polaris';
import enTranslations from '@shopify/polaris/locales/en.json';
import {Action, AppActionType, PropType, PropValue, State} from '@/types';
import {components} from '@/components';
import React, {
  createElement,
  Dispatch,
  Fragment,
  ReactNode,
  useEffect,
  useState,
} from 'react';
import {useIframeCommunication} from '@/utils';
import set from 'lodash.set';

const getLayerHTMLId = (id: string): string => {
  return `rendered-layer-${id}`;
};

function Canvas() {
  const [state, dispatch] = useIframeCommunication();

  const [calloutPosition, setCalloutPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (!state.hoveredLayerId) return;

    const id = `#${getLayerHTMLId(state.hoveredLayerId)}`;
    const hoveredElementId = document.querySelector(id) as HTMLElement;
    if (!hoveredElementId) return;

    const {top, left, width, height} = hoveredElementId.getBoundingClientRect();
    setCalloutPosition({top, left, width, height});
  }, [state.hoveredLayerId, state.layers]);

  return (
    <div className={styles.Canvas}>
      {state.hoveredLayerId && (
        <div
          className={styles.Callout}
          style={{
            top: calloutPosition.top,
            left: calloutPosition.left,
            width: calloutPosition.width,
            height: calloutPosition.height,
          }}
        ></div>
      )}

      <AppProvider i18n={enTranslations}>
        <Frame>
          <div className={styles.Views}>
            {Object.values(state.views)
              .filter((view) => view.type === 'View')
              .map((view) => {
                return (
                  <div key={view.id} className={styles.View}>
                    <div
                      className={styles.ViewLabel}
                      onClick={() =>
                        dispatch({
                          type: 'SET_SELECTED_VIEW_ID',
                          viewId: view.id,
                        })
                      }
                    >
                      {view.name}
                    </div>
                    <div
                      className={styles.ViewContent}
                      data-is-selected={state.selectedViewId === view.id}
                    >
                      {Object.values(state.layers)
                        .filter(({viewId}) => viewId === view.id)
                        .filter(({parent}) => parent === null)
                        .map(({id}, iteration) => {
                          return renderLayer({
                            layerId: id,
                            state,
                            dispatch,
                          });
                        })}
                    </div>
                  </div>
                );
              })}
          </div>
        </Frame>
      </AppProvider>
    </div>
  );
}

const sheetRegex = /{([A-Z]+):([0-9]+)}/g;

const parseAppStateKey = (
  text: string,
): {sheetId: string | null; columnIndex: number; rowIndex: number} | null => {
  const [col, row] = text.split(':').map((part) => part.trim());
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.toUpperCase().split('');
  const columnIndex = alphabet.indexOf(col);
  const rowIndex = parseInt(row) - 1;

  return {
    sheetId: null,
    columnIndex,
    rowIndex,
  };
};

const injectVariables = (
  state: State,
  text: string,
  variables?: {[key: string]: string},
): string => {
  let output = text;

  if (variables) {
    Object.entries(variables).forEach(([key, value]) => {
      output = output.replaceAll(`$${key}`, value);
    });
  }

  output = output.replace(sheetRegex, (match, col, row) => {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.toUpperCase().split('');
    const colIndex = alphabet.indexOf(col);
    const rowIndex = parseInt(row) - 1;
    const value = state.appState.sheets[0].columns[colIndex].rows[rowIndex];
    if (value) {
      return value.temporaryValue || value.value;
    } else {
      return '';
    }
  });

  return output;
};

const renderLayer = ({
  layerId,
  state,
  dispatch,
  iteration,
  preventRepeat,
  inheritedVariables,
}: {
  layerId: string;
  state: State;
  dispatch: Dispatch<Action>;
  iteration?: number;
  preventRepeat?: true;
  inheritedVariables?: {[key: string]: string};
}): React.ReactNode => {
  const layer = state.layers.find((layer) => layer.id === layerId);
  if (!layer) return null;
  const {component} = layer;

  const alphabet = 'ijklmnopqrstuvwxyz'.split('');
  const iterationKey = inheritedVariables
    ? alphabet[Object.keys(inheritedVariables).length]
    : alphabet[0];

  if (layer.repeat > 1 && !preventRepeat) {
    let children: ReactNode[] = [];
    [...Array(layer.repeat)].forEach((_, index) => {
      children.push(
        renderLayer({
          layerId: layer.id,
          state,
          dispatch,
          iteration: index + 1,
          preventRepeat: true,
          inheritedVariables,
        }),
      );
    });
    return createElement(Fragment, {}, children);
  }

  let variables: {[key: string]: string} = {
    ...inheritedVariables,
    [iterationKey]: iteration ? iteration.toString() : '1',
  };

  const reactComponent = components[component].reactComponent;

  let reactProps: {[key: string]: any} = {};

  function recursivelyPrepareProps(
    props: {[id: string]: PropValue},
    prevPropPath: string[] = [],
  ) {
    function setProp(key: string, value: any) {
      reactProps = {
        ...reactProps,
        ...set(reactProps, [...prevPropPath, key].join('.'), value),
      };
    }

    Object.entries(props).forEach(([propKey, propValue]) => {
      switch (propValue.type) {
        case PropType.Boolean:
        case PropType.Enum:
        case PropType.Number:
          setProp(propKey, propValue.value);
          break;

        case PropType.String:
          setProp(propKey, injectVariables(state, propValue.value, variables));

          break;

        case PropType.ReactNode:
          const childLayers = state.layers.filter(
            (layer) =>
              layer.parent?.layerId === layerId &&
              layer.parent?.propPath === `props.${propKey}`,
          );
          setProp(propKey, [
            childLayers.map((layer) =>
              renderLayer({
                layerId: layer.id,
                state,
                dispatch,
                inheritedVariables: variables,
              }),
            ),
          ]);
          // TODO
          break;

        case PropType.Action:
          let actions: (() => void)[] = [];
          propValue.value.forEach((action) => {
            switch (action.type) {
              case AppActionType.Alert:
                actions.push(() => alert(action.message));
                break;

              case AppActionType.Navigate:
                actions.push(() =>
                  dispatch({
                    type: 'SET_SELECTED_VIEW_ID',
                    viewId: action.viewId,
                  }),
                );
                break;

              case AppActionType.SetState:
                actions.push(() => {
                  const appStateKey = parseAppStateKey(
                    injectVariables(state, action.key, variables),
                  );
                  if (appStateKey) {
                    dispatch({
                      type: 'UPDATE_APP_STATE',
                      sheetId: state.appState.sheets[0].id,
                      columnIndex: appStateKey.columnIndex,
                      rowIndex: appStateKey.rowIndex,
                      value: injectVariables(state, action.value, variables),
                      temporaryState: true,
                    });
                  }
                });
            }
          });
          setProp(propKey, () => actions.forEach((action) => action()));
          break;

        case PropType.Group: {
          recursivelyPrepareProps(propValue.children, [
            ...prevPropPath,
            propKey,
          ]);
        }
      }
    });
  }

  recursivelyPrepareProps(layer.props);

  // if (
  //   children.length === 0 &&
  //   props.children &&
  //   props.children.type === PropType.String
  // ) {
  //   children = [props.children.value];
  // }

  console.log({log: 'createElement', reactComponent, reactProps});

  return createElement(reactComponent, reactProps);
};

export default Canvas;
