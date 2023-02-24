export type ReactProps = {
  [propName: string]: any;
};

interface BasePropDefinition<T> {
  isArrayed: boolean;
  isRequired: boolean;
  description: string;
  defaultValue: T;
}

export type PropPath = {
  node: string;
  index?: number;
}[];

export enum PropType {
  String = 'string',
  Boolean = 'boolean',
  Enum = 'enum',
  ReactNode = 'ReactNode',
  Number = 'number',
  Action = 'action',
  Group = 'group',
}

// Strings
interface StringPropDefinition extends BasePropDefinition<StringPropValue> {
  type: PropType.String;
}

interface StringPropValue {
  type: PropType.String;
  value: Array<string>;
}

// Booleans
interface BooleanPropDefinition extends BasePropDefinition<BooleanPropValue> {
  type: PropType.Boolean;
}

interface BooleanPropValue {
  type: PropType.Boolean;
  value: Array<boolean>;
}

// Enums
interface EnumPropDefinition extends BasePropDefinition<EnumPropValue> {
  type: PropType.Enum;
  options: Array<string>;
}

interface EnumPropValue {
  type: PropType.Enum;
  value: Array<string>;
}

// Numbers
interface NumberPropDefinition extends BasePropDefinition<NumberPropValue> {
  type: PropType.Number;
}

interface NumberPropValue {
  type: PropType.Number;
  value: Array<number>;
}

// React nodes
interface ReactNodePropDefinition
  extends BasePropDefinition<ReactNodePropValue> {
  type: PropType.ReactNode;
}

interface ReactNodePropValue {
  type: PropType.ReactNode;
  value: [];
}

// Actions
interface ActionPropDefinition extends BasePropDefinition<ActionPropValue> {
  type: PropType.Action;
}

interface ActionPropValue {
  type: PropType.Action;
  value: Array<AppActionSet>;
}

// Grouping
export interface GroupPropDefinition
  extends BasePropDefinition<GroupPropValue> {
  type: PropType.Group;
  value: {
    [key: string]: PropDefinition;
  };
}

type GroupPropValue = {
  type: PropType.Group;
  value: Array<{
    [key: string]: PropValue;
  }>;
};

export enum AppActionType {
  Alert = 'Alert',
  Navigate = 'Navigate',
  SetState = 'Set state',
}

type AlertAppAction = {
  type: AppActionType.Alert;
  message: string;
};

type NavigateAppAction = {
  type: AppActionType.Navigate;
  viewId: string;
};

type SetStateAppAction = {
  type: AppActionType.SetState;
  key: string;
  value: string;
};

type AppAction = AlertAppAction | NavigateAppAction | SetStateAppAction;

export type AppActionSet = AppAction[];

export type PropDefinition =
  | StringPropDefinition
  | BooleanPropDefinition
  | EnumPropDefinition
  | ReactNodePropDefinition
  | NumberPropDefinition
  | ActionPropDefinition
  | GroupPropDefinition;

export type PropValue =
  | StringPropValue
  | BooleanPropValue
  | EnumPropValue
  | ReactNodePropValue
  | NumberPropValue
  | ActionPropValue
  | GroupPropValue;

export interface View {
  id: string;
  name: string;
  selectedLayerId: string | null;
  type: 'CustomComponent' | 'View';
}

type LayerParent = {
  layerId: string;
  propPath: PropPath;
};

export interface Layer {
  viewId: string;
  id: string;
  title: string;
  parent: LayerParent | null;
  component: ComponentName;
  repeat: number;
  props: {
    [id: string]: PropValue;
  };
}

// export type ComponentName = keyof typeof components;
export type ComponentName = string;

export interface AppState {
  sheets: {
    id: string;
    name: string;
    columns: {
      name: string;
      rows: {
        value: string;
        temporaryValue: string | null;
      }[];
    }[];
  }[];
}

export interface State {
  views: View[];
  layers: Layer[];
  hoveredLayerId: string | null;
  selectedViewId: string;
  layerAdderVisibility: LayerParent | null | false;
  appState: AppState;
}

type AddLayerAction = {
  type: 'ADD_LAYER';
  parent: LayerParent | null;
  componentName: ComponentName;
};

type SelectLayerAction = {
  type: 'SELECT_LAYER';
  layerId: string;
};

type SetHoveredLayerIdAction = {
  type: 'SET_HOVERED_LAYER_ID';
  layerId: string | null;
};

type SetSelectedViewIdAction = {
  type: 'SET_SELECTED_VIEW_ID';
  viewId: string;
};

type SetLayerRepeatAction = {
  type: 'SET_LAYER_REPEAT';
  layerId: string;
  repeat: number;
};

type SetPropAction = {
  type: 'SET_PROP';
  layerId: string;
  propPath: PropPath;
  value: PropValue;
  index: number;
};

type ShowLayerAdderAction = {
  type: 'SHOW_LAYER_ADDER';
  parent: LayerParent | null;
};

type HideLayerAdderAction = {
  type: 'HIDE_LAYER_ADDER';
};

type UpdateAppStateAction = {
  type: 'UPDATE_APP_STATE';
  sheetId: string;
  columnIndex: number;
  rowIndex: number;
  temporaryState: boolean;
  value: string;
};

type AddAppStateSheetAction = {
  type: 'ADD_APP_STATE_SHEET';
};

export type Action =
  | SelectLayerAction
  | AddLayerAction
  | SetHoveredLayerIdAction
  | SetSelectedViewIdAction
  | SetLayerRepeatAction
  | SetPropAction
  | ShowLayerAdderAction
  | HideLayerAdderAction
  | UpdateAppStateAction
  | AddAppStateSheetAction;

export type BaseMessage = {
  source: 'polaris-studio';
};

export interface MessageFromIframe extends BaseMessage {
  action: Action;
}

export interface MessageToIframe extends BaseMessage {
  state: State;
}

export interface ComponentMap {
  [key: string]: {
    reactComponent: any;
    renderPreview?: () => React.ReactNode;
    description: string;
    props: {
      [key: string]: PropDefinition;
    };
  };
}

export interface PartialComponentMap {
  [key: string]: {
    props: {
      [key: string]: PropDefinition;
    };
  };
}
