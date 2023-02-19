import {components} from '@/components';
import {
  AppActionType,
  Layer,
  PropDefinition,
  PropType,
  PropValue,
} from '@/types';
import {Tooltip} from 'react-tooltip';
import {ReactNode, useContext, useId} from 'react';
import {StateContext} from '../App/App';
import {Switch} from '@headlessui/react';
import untypedComponentUsageSimplified from '../../data/componentsUsageSimplified.json';
import styles from './Inspector.module.scss';

const componentUsageSimplified = untypedComponentUsageSimplified as {
  [key: string]: {
    total: {
      renders: number;
      properties: number;
      variants: number;
    };
    properties: {
      [key: string]: number;
    };
  };
};

interface Props {}

function Inspector({}: Props) {
  const {state} = useContext(StateContext);
  const {layers, views, selectedViewId} = state;

  const selectedView = views.find((view) => view.id === selectedViewId);
  if (!selectedView) return null;

  const {selectedLayerId} = selectedView;
  if (!selectedLayerId) return null;

  const selectedLayer = layers.find((layer) => layer.id === selectedLayerId);
  if (!selectedLayer) return null;

  return <InspectorFields groupKeys={[]} layer={selectedLayer} />;
}

function getValue<T>(object: any, path: string): T {
  return path
    .replace(/\[/g, '.')
    .replace(/\]/g, '')
    .split('.')
    .reduce((o, k) => (o || {})[k], object);
}

function LabelTooltip({
  tooltipContent,
  children,
}: {
  tooltipContent: string;
  children: ReactNode;
}) {
  const id = useId();

  return (
    <>
      <label id={id}>{children}</label>
      <Tooltip
        anchorId={id}
        style={{
          opacity: 1,
          backgroundColor: 'white',
          color: 'black',
          maxWidth: 300,
          textAlign: 'center',
        }}
        delayShow={500}
      >
        {tooltipContent}
      </Tooltip>
    </>
  );
}

function InspectorFields({
  groupKeys,
  layer,
}: {
  groupKeys: string[];
  layer: Layer;
}) {
  const {state, dispatch} = useContext(StateContext);
  const {views} = state;

  let prevPropPath = `props`;
  if (groupKeys.length > 0) {
    prevPropPath = `${prevPropPath}.${groupKeys.join('.children.')}.children`;
  }

  // console.log({ prevPropPath });

  const props = getValue<{[key: string]: PropDefinition}>(
    components[layer.component],
    prevPropPath,
  );

  // console.log({ props });

  return (
    <div className={styles.Inspector}>
      {props &&
        Object.entries(props)
          .sort((a, b) => {
            return componentUsageSimplified[layer.component]
              ? (componentUsageSimplified[layer.component].properties[b[0]] ||
                  0) -
                  (componentUsageSimplified[layer.component].properties[a[0]] ||
                    0)
              : 0;
          })
          .map(([propKey, propDefinition]) => {
            const propPath = `${prevPropPath}.${propKey}`;
            const propValue = getValue<PropValue>(layer, propPath);
            const key = propPath;
            const label = propDefinition.alias || propKey || key || propKey;

            // if (!propValue) {
            //   // TODO: This shouldn't happen. This means that default props haven't
            //   // been created at propPath which is a bug. Ooooor, can we change the
            //   // system to not create any default props at all and just create
            //   // them on the fly when the user actually sets a prop? Hmm...
            //   return null;
            // }

            switch (propDefinition.type) {
              case PropType.String: {
                const value =
                  propValue && propValue.type === PropType.String
                    ? propValue.value
                    : propDefinition.defaultValue.value;

                return (
                  <InspectorRow
                    label={label}
                    tooltip={propDefinition.description}
                    renderField={() => (
                      <input
                        type="text"
                        placeholder="Lorem ipsum dolor..."
                        value={value}
                        onChange={(evt) => {
                          let value: string | number | boolean =
                            evt.target.value;

                          dispatch({
                            type: 'SET_PROP',
                            layerId: layer.id,
                            propType: PropType.String,
                            propPath,
                            value,
                          });
                        }}
                      />
                    )}
                  />
                );
              }

              case PropType.Number: {
                const value =
                  propValue && propValue.type === PropType.Number
                    ? propValue.value
                    : propDefinition.defaultValue.value;

                return (
                  <InspectorRow
                    label={label}
                    tooltip={propDefinition.description}
                    renderField={() => (
                      <input
                        type="number"
                        value={value.toString()}
                        onChange={(evt) => {
                          let value: number = parseInt(evt.target.value);

                          dispatch({
                            type: 'SET_PROP',
                            layerId: layer.id,
                            propType: PropType.Number,
                            propPath,
                            value,
                          });
                        }}
                      />
                    )}
                  />
                );
              }

              case PropType.Boolean: {
                const value =
                  propValue && propValue.type === PropType.Boolean
                    ? propValue.value
                    : propDefinition.defaultValue.value;
                const checked = !!value;

                return (
                  <InspectorRow
                    label={label}
                    tooltip={propDefinition.description}
                    renderField={() => (
                      <Switch
                        checked={checked}
                        onChange={(value: boolean) => {
                          dispatch({
                            type: 'SET_PROP',
                            layerId: layer.id,
                            propType: PropType.Boolean,
                            propPath,
                            value,
                          });
                        }}
                        className={`${checked ? styles.checked : ''} ${
                          styles.Toggle
                        }`}
                      >
                        <span className="sr-only">{key}</span>
                        <span className={styles.Handle} />
                      </Switch>
                    )}
                  />
                );
              }

              case PropType.Enum: {
                const value =
                  propValue && propValue.type === PropType.Enum
                    ? propValue.value
                    : propDefinition.defaultValue.value;

                return (
                  <InspectorRow
                    label={label}
                    tooltip={propDefinition.description}
                    renderField={() => (
                      <select
                        value={value}
                        onChange={(evt) => {
                          dispatch({
                            type: 'SET_PROP',
                            layerId: layer.id,
                            propType: PropType.Enum,
                            propPath,
                            value: evt.target.value,
                          });
                        }}
                      >
                        {propDefinition.options.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                );
              }

              case PropType.Action: {
                const value =
                  propValue && propValue.type === PropType.Action
                    ? propValue.value
                    : propDefinition.defaultValue.value;

                return (
                  <InspectorRow
                    label={label}
                    tooltip={propDefinition.description}
                    renderField={() => {
                      return (
                        <select
                          onChange={(e) => {
                            let newValue = [...value];

                            if (e.target.value === AppActionType.Alert) {
                              newValue.push({
                                type: AppActionType.Alert,
                                message: 'My message',
                              });
                            }

                            if (e.target.value === AppActionType.Navigate) {
                              newValue.push({
                                type: AppActionType.Navigate,
                                viewId: Object.values(views)[0].id,
                              });
                            }

                            if (e.target.value === AppActionType.SetState) {
                              newValue.push({
                                type: AppActionType.SetState,
                                key: '',
                                value: '',
                              });
                            }

                            dispatch({
                              type: 'SET_PROP',
                              layerId: layer.id,
                              propPath,
                              propType: PropType.Action,
                              value: newValue,
                            });
                          }}
                        >
                          {Object.values(AppActionType).map((type) => (
                            <option>{type}</option>
                          ))}
                        </select>
                      );
                    }}
                    renderChildren={() => {
                      if (value.length > 0) {
                        return (
                          <ul className={styles.ActionList}>
                            {value.map((action, index) => {
                              switch (action.type) {
                                case AppActionType.Alert:
                                  return (
                                    <li key={index}>
                                      <label>Alert </label>
                                      <input
                                        type="text"
                                        value={action.message}
                                        onChange={(evt) => {
                                          dispatch({
                                            type: 'SET_PROP',
                                            layerId: layer.id,
                                            propPath,
                                            propType: PropType.Action,
                                            value: [
                                              ...value.slice(0, index),
                                              {
                                                ...action,
                                                message: evt.target.value,
                                              },
                                              ...value.slice(index + 1),
                                            ],
                                          });
                                        }}
                                      />
                                      {/* <button
                                        onClick={() => {
                                          dispatch({
                                            type: 'SET_PROP',
                                            layerId: layer.id,
                                            propType: PropType.Action,
                                            propPath,
                                            value: [
                                              ...value.slice(0, index),
                                              ...value.slice(index + 1),
                                            ],
                                          });
                                        }}
                                      >
                                        Delete action
                                      </button> */}
                                    </li>
                                  );

                                case AppActionType.Navigate:
                                  return (
                                    <li key={index}>
                                      <label>Navigate to </label>
                                      <select
                                        value={action.viewId}
                                        onChange={(evt) => {
                                          dispatch({
                                            type: 'SET_PROP',
                                            layerId: layer.id,
                                            propPath,
                                            propType: PropType.Action,
                                            value: [
                                              ...value.slice(0, index),
                                              {
                                                ...action,
                                                viewId: evt.target.value,
                                              },
                                              ...value.slice(index + 1),
                                            ],
                                          });
                                        }}
                                      >
                                        {Object.values(views)
                                          .filter(
                                            (view) => view.type === 'View',
                                          )
                                          .map((view) => (
                                            <option
                                              key={view.id}
                                              value={view.id}
                                            >
                                              {view.name}
                                            </option>
                                          ))}
                                      </select>
                                    </li>
                                  );

                                case AppActionType.SetState:
                                  return (
                                    <li key={index} className={styles.setState}>
                                      <label>Set state </label>
                                      <InspectorRow
                                        label="Key"
                                        tooltip=""
                                        renderField={() => (
                                          <input
                                            type="text"
                                            onChange={(evt) => {
                                              dispatch({
                                                type: 'SET_PROP',
                                                layerId: layer.id,
                                                propPath,
                                                propType: PropType.Action,
                                                value: [
                                                  ...value.slice(0, index),
                                                  {
                                                    ...action,
                                                    key: evt.target.value,
                                                  },
                                                  ...value.slice(index + 1),
                                                ],
                                              });
                                            }}
                                            value={action.key}
                                          />
                                        )}
                                      />

                                      <InspectorRow
                                        label="Value"
                                        tooltip=""
                                        renderField={() => (
                                          <input
                                            type="text"
                                            onChange={(evt) => {
                                              dispatch({
                                                type: 'SET_PROP',
                                                layerId: layer.id,
                                                propPath,
                                                propType: PropType.Action,
                                                value: [
                                                  ...value.slice(0, index),
                                                  {
                                                    ...action,
                                                    value: evt.target.value,
                                                  },
                                                  ...value.slice(index + 1),
                                                ],
                                              });
                                            }}
                                            value={action.value}
                                          />
                                        )}
                                      />
                                    </li>
                                  );
                              }
                            })}
                          </ul>
                        );
                      }
                      return null;
                    }}
                  />
                );
              }

              case PropType.Group: {
                return (
                  <InspectorRow
                    label={label}
                    tooltip={propDefinition.description}
                    renderChildren={() => {
                      if (propDefinition.type === PropType.Group) {
                        return (
                          <InspectorFields
                            groupKeys={[...groupKeys, propKey]}
                            layer={layer}
                          />
                        );
                      }
                      return null;
                    }}
                  />
                );
              }
            }
          })}
    </div>
  );
}

function InspectorRow({
  label,
  tooltip,
  renderField,
  renderChildren,
}: {
  label: string;
  tooltip: string;
  renderField?: () => React.ReactNode;
  renderChildren?: () => React.ReactNode;
}) {
  return (
    <div className={styles.InspectorRow}>
      <div className={styles.LabelAndField}>
        <LabelTooltip tooltipContent={tooltip}>{label}</LabelTooltip>
        {renderField && renderField()}
      </div>
      {renderChildren && (
        <div className={styles.Children}>{renderChildren()}</div>
      )}
    </div>
  );
}

export default Inspector;
