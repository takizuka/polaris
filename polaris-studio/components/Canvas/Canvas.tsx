'use client';

import styles from './Canvas.module.scss';
import '@shopify/polaris/build/esm/styles.css';
import {AppProvider} from '@shopify/polaris';
import enTranslations from '@shopify/polaris/locales/en.json';
import {Action, AppActionType, PropType, PropValue, State} from '@/types';
import {components} from '@/components';
import React, {
  createElement,
  Dispatch,
  MouseEventHandler,
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
                      .map(({id}) =>
                        renderLayer({layerId: id, state, dispatch}),
                      )}
                  </div>
                </div>
              );
            })}
        </div>

        {/* <div className={styles.Views}>
          {Object.values(state.views)
            .filter((view) => view.type === "CustomComponent")
            .map((view) => {
              return (
                <div
                  key={view.id}
                  className={styles.View}
                  onClick={() =>
                    dispatch({
                      type: "SET_SELECTED_VIEW_ID",
                      viewId: view.id,
                    })
                  }
                >
                  {Object.values(state.layers)
                    .filter(({ viewId }) => viewId === view.id)
                    .filter(({ parentId }) => parentId === null)
                    .map(({ id }) => render({ layerId: id, state, dispatch }))}
                </div>
              );
            })}
        </div> */}
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

const injectVariables = (state: State, text: string): string => {
  return text.replace(sheetRegex, (match, col, row) => {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.toUpperCase().split('');
    const colIndex = alphabet.indexOf(col);
    const rowIndex = parseInt(row) - 1;
    const value = state.appState.sheets[0].columns[colIndex].rows[rowIndex];
    return value.temporaryValue || value.value;
  });
};

const renderLayer = ({
  layerId,
  state,
  dispatch,
}: {
  layerId: string;
  state: State;
  dispatch: Dispatch<Action>;
}): React.ReactNode => {
  const layer = state.layers.find((layer) => layer.id === layerId);
  if (!layer) return null;
  const {component, props} = layer;

  // const childLayers = state.layers.filter(
  //   (layer) => layer.parent?.layerId === layerId && layer.parent?.type
  // );
  // let children = childLayers.map((layer) =>
  //   renderLayer({ layerId: layer.id, state, dispatch })
  // );

  // if (children.length === 0) {
  //   const component = components[layer.component];
  //   if (
  //     component.props.children &&
  //     component.props.children.type === "ReactNode"
  //   ) {
  //     children = [
  //       <div key="add-layer-hint" className={styles.ChildHint}>
  //         <button
  //           onClick={() =>
  //             dispatch({ type: "SHOW_LAYER_ADDER", parentLayerId: id })
  //           }
  //         >
  //           +
  //         </button>
  //       </div>,
  //     ];
  //   }
  // }
  // const HTMLId = getLayerHTMLId(id);

  // const eventHandlers: {
  //   onClick: MouseEventHandler<HTMLDivElement>;
  //   onMouseEnter: MouseEventHandler<HTMLDivElement>;
  //   onMouseLeave: MouseEventHandler<HTMLDivElement>;
  // } = {
  //   onClick: (event) => {
  //     dispatch({
  //       type: "SET_SELECTED_VIEW_ID",
  //       viewId: layer.viewId,
  //     });
  //     dispatch({
  //       type: "SELECT_LAYER",
  //       layerId: layer.id,
  //     });
  //     event.stopPropagation();
  //   },
  //   onMouseEnter: (event) => {
  //     dispatch({
  //       type: "SET_HOVERED_LAYER_ID",
  //       layerId: id,
  //     });
  //     event.stopPropagation();
  //   },
  //   onMouseLeave: (event) => {
  //     dispatch({
  //       type: "SET_HOVERED_LAYER_ID",
  //       layerId: null,
  //     });
  //     event.stopPropagation();
  //   },
  // };

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
          setProp(propKey, injectVariables(state, propValue.value));
          break;

        case PropType.ReactNode:
          const childLayers = state.layers.filter(
            (layer) =>
              layer.parent?.layerId === layerId &&
              layer.parent?.propPath === `props.${propKey}`,
          );
          setProp(propKey, [
            childLayers.map((layer) =>
              renderLayer({layerId: layer.id, state, dispatch}),
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
                  const appStateKey = parseAppStateKey(action.key);
                  if (appStateKey) {
                    dispatch({
                      type: 'UPDATE_APP_STATE',
                      sheetId: state.appState.sheets[0].id,
                      columnIndex: appStateKey.columnIndex,
                      rowIndex: appStateKey.rowIndex,
                      value: action.value,
                      temporaryState: true,
                    });
                  }
                });
            }
          });
          setProp(propKey, () => actions.forEach((action) => action()));
          break;

        case PropType.Group: {
          Object.entries(propValue.children).forEach(
            ([subKey, subValue]) => {},
          );
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
