import React, {
  createElement,
  Dispatch,
  ReactNode,
  useEffect,
  useState,
} from 'react';
import {initialState} from './components/App/App';
import {
  Action,
  AppActionSet,
  AppActionType,
  ComponentMap,
  Layer,
  MessageFromIframe,
  MessageToIframe,
  PropDefinition,
  PropPath,
  PropType,
  PropValue,
  ReactProps,
  State,
} from './types';

export function useIframeCommunication(): [
  state: State,
  dispatch: Dispatch<Action>,
] {
  const [state, setState] = useState<State>(initialState);

  const dispatch = (action: Action) => {
    const message: MessageFromIframe = {source: 'polaris-studio', action};
    console.log({log: 'Iframe is sending a message...', message});
    window.parent.postMessage(message);
  };

  useEffect(() => {
    console.log({log: 'Iframe is listening for messages...'});
    const listener = (event: MessageEvent<MessageToIframe>) => {
      const {state, source} = event.data;
      if (source !== 'polaris-studio') return;
      console.log({log: 'Iframe recieved a message...', state});
      setState(state);
    };
    window.addEventListener('message', listener, false);
    return () => window.removeEventListener('message', listener);
  }, []);

  return [state, dispatch];
}

export const slugify = (str: string): string => {
  return (
    str
      // Camel to hyphen case
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      // Replace spaces with hyphens
      .replace(/[^a-z0-9]/gi, '-')
      .toLowerCase()
  );
};

export const className = (
  ...classNames: (string | boolean | null | undefined)[]
): string => {
  return classNames.filter((className) => Boolean(className)).join(' ');
};

const validatePropPath = (propPath: PropPath) => {
  if (propPath[0].node === 'props') {
    throw new Error('Prop paths should not start with "props"');
  }
};

export const stringifyPropPath = (
  type: 'definition' | 'value',
  path: PropPath,
) => {
  if (path.length === 0) {
    throw new Error('Cannot stringify an empty prop path');
  }
  if (type === 'definition') {
    return path.map((node) => node.node).join('.value.');
  } else {
    let stringPath = '';
    path.forEach((node, i) => {
      stringPath += node.node;
      if (i < path.length - 1) {
        stringPath += `.value[${node.index || 0}].`;
      }
    });
    return stringPath;
  }
};

export const getPropDefinition = (
  components: ComponentMap,
  layer: Layer,
  propPath: PropPath,
): PropDefinition | null => {
  const propDefinitions = components[layer.component].props;

  function recursivelySearch(
    propDefinitionNode: {
      [key: string]: PropDefinition;
    },
    level: number,
  ): PropDefinition | null {
    const currentSegment = propPath[level].node;
    const propDefinition = propDefinitionNode[currentSegment];
    if (propDefinition) {
      if (level === propPath.length - 1) {
        return propDefinition;
      } else {
        if (propDefinition.type === PropType.Group) {
          return recursivelySearch(propDefinition.value, level + 1);
        }
      }
    }
    return null;
  }

  return recursivelySearch(propDefinitions, 0);
};

export const getPropDefinitions = (
  components: ComponentMap,
  layer: Layer,
): {[key: string]: PropDefinition} | null => {
  const propDefinitions = components[layer.component].props;
  return propDefinitions || null;
};

export const insertIntoPropValue = (
  propValue: PropValue,
  index: number,
  newItem: PropValue['value'][0],
): PropValue => {
  const newPropValue = {
    ...propValue,
    value: [
      ...propValue.value.slice(0, index),
      newItem,
      ...propValue.value.slice(index),
    ],
  };

  // TODO: Make this more type safe
  // @ts-expect-error
  return newPropValue;
};

export const addToPropValue = (
  propValue: PropValue,
  index: number,
  newItem: PropValue['value'][0],
): PropValue => {
  const newPropValue = {
    ...propValue,
    value: [...propValue.value, newItem],
  };

  // TODO: Make this more type safe
  // @ts-expect-error
  return newPropValue;
};

export const updatePropValue = (
  propValue: PropValue,
  index: number,
  value: PropValue['value'][0],
): PropValue => {
  if (index > propValue.value.length - 1) {
    throw new Error(
      `Can't set the prop value at index ${index} (only ${propValue.value.length} items in value array)`,
    );
  }
  const newPropValue = {
    ...propValue,
    value: [
      ...propValue.value.slice(0, index),
      value,
      ...propValue.value.slice(index + 1),
    ],
  };
  // TODO: Make this more type safe
  // @ts-expect-error
  return newPropValue;
};

export const removePropValue = (
  propValue: PropValue,
  index: number,
): PropValue => {
  const newPropValue = {
    ...propValue,
    value: [
      ...propValue.value.slice(0, index),
      ...propValue.value.slice(index + 1),
    ],
  };

  // TODO: Make this more type safe
  // @ts-expect-error
  return newPropValue;
};

export const getPropValue = (
  layer: Layer,
  propPath: PropPath,
): PropValue | null => {
  function recursivelySearch(
    propValueNode: {
      [key: string]: PropValue;
    },
    level: number,
  ): PropValue | null {
    const currentSegment = propPath[level];
    const propValue = propValueNode[currentSegment.node];
    if (propValue) {
      if (level === propPath.length - 1) {
        return propValue;
      } else {
        if (propValue.type === PropType.Group) {
          return recursivelySearch(propValue.value[0], level + 1);
        }
      }
    }
    return null;
  }

  return recursivelySearch(layer.props, 0);
};

export const setPropValue = (
  props: {[key: string]: PropValue},
  propPath: PropPath,
  value: PropValue,
): {[key: string]: PropValue} => {
  let returnedProps = {...props};

  function recursivelySearch(
    propNode: {[key: string]: PropValue},
    propPathIndex: number,
  ): ReactProps {
    const currentPropPath = propPath[propPathIndex];
    let currentValue = propNode[currentPropPath.node];

    if (propPathIndex < propPath.length - 1) {
      if (!currentValue) {
        propNode[currentPropPath.node] = {
          type: PropType.Group,
          value: [{}],
        };
      }
      currentValue = propNode[currentPropPath.node];
      if (currentValue.type === PropType.Group) {
        recursivelySearch(currentValue.value[0], propPathIndex + 1, value);
      }
    } else {
      propNode[currentPropPath.node] = value;
    }

    return propNode;
  }

  returnedProps = recursivelySearch(props, 0);

  console.log({
    log: 'ATTEMPTING TO UPDATE PROPS',
    incomingProps: JSON.stringify(props, null, 2),
    path: propPath,
    valueToSet: JSON.stringify(value, null, 2),
    returned: JSON.stringify(returnedProps, null, 2),
  });

  return returnedProps;
};

export function createReactProps({
  components,
  state,
  dispatch,
  layer,
  propPath,
}: {
  components: ComponentMap;
  state: State;
  dispatch: Dispatch<Action>;
  layer: Layer;
  propPath?: PropPath;
}) {
  let returnedProps: ReactProps = {};
  let propDefinitions = getPropDefinitions(components, layer);
  if (propPath && propPath.length) {
    const singlePropDefinition = getPropDefinition(components, layer, propPath);
    if (singlePropDefinition?.type === PropType.Group) {
      propDefinitions = singlePropDefinition.value;
    }
  }

  if (!propDefinitions) {
    throw new Error('Prop definitions not found');
  }

  Object.entries(propDefinitions).forEach(([key, propDefinition]) => {
    const newPropPath: PropPath = [...(propPath || []), {node: key}];
    const value = getPropValue(layer, newPropPath);

    if (value) {
      switch (propDefinition.type) {
        case PropType.Group:
          const subProps = createReactProps({
            components,
            state,
            dispatch,
            layer,
            propPath: newPropPath,
          });
          returnedProps[key] = subProps;
          break;

        case PropType.Action:
          if (value.type === PropType.Action) {
            const fn = combineAppActions({
              state,
              dispatch,
              appActionSets: value.value,
            });
            returnedProps[key] = fn;
          }
          break;

        default:
          returnedProps[key] = propDefinition?.isArrayed
            ? value.value
            : value.value[0];
          break;
      }
    } else {
      if (propDefinition.isRequired) {
        returnedProps[key] = propDefinition.isArrayed
          ? propDefinition.defaultValue.value
          : propDefinition.defaultValue.value[0];
      }
    }

    if (propDefinition.type === PropType.ReactNode) {
      const childLayers = getChildLayers(state, layer, newPropPath);
      const childLayerNodes: ReactNode[] = [];
      childLayers.forEach((childLayer) => {
        const component = components[childLayer.component].reactComponent;
        const props: ReactProps = {
          key,
          ...createReactProps({components, state, dispatch, layer: childLayer}),
        };
        const childElement = createElement(component, props);
        childLayerNodes.push(childElement);
      });

      if (childLayerNodes.length > 0) {
        // returnedProps[key] = createElement(React.Fragment, {}, childLayerNodes);
        returnedProps[key] = childLayerNodes;
      } else if (propDefinition.isRequired) {
        returnedProps[key] = createElement(React.Fragment, {});
      }
    }
  });

  return returnedProps;
}

export function getPropsThatCanHaveChildren(
  components: ComponentMap,
  layer: Layer,
): {
  propPath: PropPath;
}[] {
  let propsThatCanHaveChildren: {
    propPath: PropPath;
  }[] = [];

  function recursivelySearch(
    propDefinitionNode: {
      [key: string]: PropDefinition;
    },
    pathSoFar: PropPath,
  ): PropDefinition | null {
    Object.entries(propDefinitionNode).forEach(([key, propDefinition]) => {
      const newPathSoFar = [...pathSoFar, {node: key}];
      if (propDefinition.type === PropType.Group) {
        recursivelySearch(propDefinition.value, newPathSoFar);
      } else if (propDefinition.type === PropType.ReactNode) {
        propsThatCanHaveChildren.push({propPath: newPathSoFar});
      }
    });
    return null;
  }

  const propDefinitions = getPropDefinitions(components, layer);
  if (!propDefinitions) throw new Error('Prop definitions not found');
  recursivelySearch(propDefinitions, []);

  return propsThatCanHaveChildren;
}

export const getChildLayers = (
  state: State,
  layer: Layer,
  propPath?: PropPath,
): Layer[] => {
  const {layers} = state;
  if (propPath) {
    return layers.filter(
      (thisLayer) =>
        thisLayer.parent !== null &&
        thisLayer.parent.layerId === layer.id &&
        propPathsAreEqual(thisLayer.parent.propPath, propPath, false),
    );
  } else {
    return layers.filter(
      (thisLayer) =>
        thisLayer.parent !== null && thisLayer.parent.layerId === layer.id,
    );
  }
};

export const propPathsAreEqual = (
  a: PropPath,
  b: PropPath,
  matchIndices: boolean,
): boolean => {
  if (matchIndices) {
    return a.toString() === b.toString();
  } else {
    return (
      a.map(({node}) => node).toString() === b.map(({node}) => node).toString()
    );
  }
};

export const combineAppActions = ({
  state,
  dispatch,
  appActionSets,
}: {
  state: State;
  dispatch: Dispatch<Action>;
  appActionSets: AppActionSet[];
}): (() => void) => {
  let actions: (() => void)[] = [];

  appActionSets.forEach((appActionSet) => {
    appActionSet.forEach((action) => {
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
              // injectVariables(state, action.key, variables),
              injectVariables(state, action.key, {}),
            );
            if (appStateKey) {
              dispatch({
                type: 'UPDATE_APP_STATE',
                sheetId: state.appState.sheets[0].id,
                columnIndex: appStateKey.columnIndex,
                rowIndex: appStateKey.rowIndex,
                // value: injectVariables(state, action.value, variables),
                value: injectVariables(state, action.value, {}),
                temporaryState: true,
              });
            }
          });
      }
    });
  });
  const fn = () => actions.forEach((action) => action());
  return fn;
};

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
