import {createElement} from 'react';
import {
  ComponentMap,
  Layer,
  PropDefinition,
  PropPath,
  PropType,
  PropValue,
  ReactProps,
  State,
} from './types';
import {
  createReactProps,
  getPropDefinition,
  getPropsThatCanHaveChildren,
  getPropValue,
  insertIntoPropValue,
  removePropValue,
  setPropValue,
  stringifyPropPath,
  updatePropValue,
} from './utils';

const mockComponents: ComponentMap = {
  MyComponent: {
    description: 'Contains all prop types',
    reactComponent: function MyComponent() {
      return createElement('div', {}, 'Hello from MyComponent');
    },
    props: {
      singleString: {
        type: PropType.String,
        defaultValue: {
          type: PropType.String,
          value: ['default (required)'],
        },
        description: 'A string (required)',
        isArrayed: false,
        isRequired: true,
      },
      arrayedString: {
        type: PropType.String,
        defaultValue: {
          type: PropType.String,
          value: ['default-1', 'default-2'],
        },
        description: 'Many labels',
        isArrayed: true,
        isRequired: false,
      },
      singleBoolean: {
        type: PropType.Boolean,
        defaultValue: {
          type: PropType.Boolean,
          value: [false],
        },
        description: 'If it is enabled',
        isArrayed: false,
        isRequired: false,
      },
      arrayedBoolean: {
        type: PropType.Boolean,
        defaultValue: {
          type: PropType.Boolean,
          value: [false, false],
        },
        description: 'If the items are enabled',
        isArrayed: true,
        isRequired: false,
      },
      singleEnum: {
        type: PropType.Enum,
        defaultValue: {
          type: PropType.Enum,
          value: ['default'],
        },
        options: ['default', 'something', 'else'],
        description: 'Options to choose from',
        isArrayed: false,
        isRequired: false,
      },
      arrayedEnum: {
        type: PropType.Enum,
        defaultValue: {
          type: PropType.Enum,
          value: ['default-1', 'default-2'],
        },
        options: ['default-1', 'default-2', 'something', 'else'],
        description: 'Arrayed options to choose from',
        isArrayed: true,
        isRequired: false,
      },
      singleNumber: {
        type: PropType.Number,
        defaultValue: {
          type: PropType.Number,
          value: [42],
        },
        description: 'A number',
        isArrayed: false,
        isRequired: false,
      },
      arrayedNumber: {
        type: PropType.Number,
        defaultValue: {
          type: PropType.Number,
          value: [42, 3.14],
        },
        description: 'Many numbers',
        isArrayed: true,
        isRequired: false,
      },
      singleReactNode: {
        type: PropType.ReactNode,
        defaultValue: {
          type: PropType.ReactNode,
          value: [],
        },
        description: 'A child',
        isArrayed: false,
        isRequired: false,
      },
      arrayedReactNode: {
        type: PropType.ReactNode,
        defaultValue: {
          type: PropType.ReactNode,
          value: [],
        },
        description: 'Many children',
        isArrayed: true,
        isRequired: false,
      },
      singleAction: {
        type: PropType.Action,
        defaultValue: {
          type: PropType.Action,
          value: [],
        },
        description: 'An action',
        isArrayed: false,
        isRequired: false,
      },
      arrayedAction: {
        type: PropType.Action,
        defaultValue: {
          type: PropType.Action,
          value: [],
        },
        description: 'Many actions',
        isArrayed: true,
        isRequired: false,
      },
      groupedItems: {
        type: PropType.Group,
        defaultValue: {
          type: PropType.Group,
          value: [],
        },
        description: 'A group',
        isArrayed: false,
        isRequired: false,
        value: {
          anotherString: {
            type: PropType.String,
            defaultValue: {
              type: PropType.String,
              value: ['default (required)'],
            },
            description: 'A nested string (required)',
            isArrayed: false,
            isRequired: true,
          },
          anotherBoolean: {
            type: PropType.Boolean,
            defaultValue: {
              type: PropType.Boolean,
              value: [false],
            },
            description: 'A nested boolean',
            isArrayed: false,
            isRequired: false,
          },
          anotherEnum: {
            type: PropType.Enum,
            defaultValue: {
              type: PropType.Enum,
              value: ['default'],
            },
            options: ['default', 'something', 'else'],
            description: 'Options to choose from',
            isArrayed: false,
            isRequired: false,
          },
          anotherNumber: {
            type: PropType.Number,
            defaultValue: {
              type: PropType.Number,
              value: [42],
            },
            description: 'A number',
            isArrayed: false,
            isRequired: false,
          },
          anotherReactNode: {
            type: PropType.ReactNode,
            defaultValue: {
              type: PropType.ReactNode,
              value: [],
            },
            description: 'A child',
            isArrayed: false,
            isRequired: false,
          },
          anotherAction: {
            type: PropType.Action,
            defaultValue: {
              type: PropType.Action,
              value: [],
            },
            description: 'An action',
            isArrayed: false,
            isRequired: false,
          },
        },
      },
    },
  },
};

describe('stringifyPropPath', () => {
  describe('definitions', () => {
    it('stringifies a single prop item', () => {
      const stringified = stringifyPropPath('definition', [{node: 'foo'}]);
      expect(stringified).toEqual('foo');
    });

    it('stringifies mutliple path items', () => {
      const stringified = stringifyPropPath('definition', [
        {node: 'foo'},
        {node: 'bar'},
        {node: 'baz'},
      ]);
      expect(stringified).toEqual('foo.value.bar.value.baz');
    });

    it('stringifies throws an error if given an empty prop path', () => {
      expect(() => stringifyPropPath('definition', [])).toThrow();
    });
  });

  it('stringifies prop values', () => {
    const stringified = stringifyPropPath('value', [
      {node: 'foo'},
      {node: 'bar'},
      {node: 'baz'},
    ]);
    expect(stringified).toEqual('foo.value[0].bar.value[0].baz');
  });
});

describe('setPropValue', () => {
  it('sets a prop value at the first level', () => {
    let initialPropValues: {[key: string]: PropValue} = {
      primary: {
        type: PropType.Boolean,
        value: [false],
      },
    };
    const newProps: ReactProps = {
      ...setPropValue(initialPropValues, [{node: 'something'}], {
        type: PropType.String,
        value: ['Hello'],
      }),
    };
    expect(newProps).toMatchInlineSnapshot(`
      {
        "primary": {
          "type": "boolean",
          "value": [
            false,
          ],
        },
        "something": {
          "type": "string",
          "value": [
            "Hello",
          ],
        },
      }
    `);
  });

  it('sets a prop value at nested levels', () => {
    let initialPropValues: {[key: string]: PropValue} = {
      primary: {
        type: PropType.Boolean,
        value: [false],
      },
    };
    const newProps: ReactProps = {
      ...setPropValue(
        initialPropValues,
        [{node: 'something'}, {node: 'else'}],
        {
          type: PropType.String,
          value: ['Hello'],
        },
      ),
    };
    expect(newProps).toMatchInlineSnapshot(`
      {
        "primary": {
          "type": "boolean",
          "value": [
            false,
          ],
        },
        "something": {
          "type": "group",
          "value": [
            {
              "else": {
                "type": "string",
                "value": [
                  "Hello",
                ],
              },
            },
          ],
        },
      }
    `);
  });
});

describe('getPropDefinition', () => {
  it('retrieves a prop definition from the first level', () => {
    const layer: Layer = {
      id: 'layer-1',
      title: 'My layer',
      component: 'MyComponent',
      props: {},
      viewId: 'view-1',
      parent: null,
      repeat: 1,
    };
    const propPath = [{node: 'singleString'}];
    const propDefinition = getPropDefinition(mockComponents, layer, propPath);
    const expected: PropDefinition =
      mockComponents['MyComponent'].props.singleString;
    expect(propDefinition).toEqual(expected);
  });

  it('retrieves a prop definition from the second level', () => {
    const layer: Layer = {
      id: 'layer-1',
      title: 'My layer',
      component: 'MyComponent',
      props: {},
      viewId: 'view-1',
      parent: null,
      repeat: 1,
    };
    const propPath = [{node: 'groupedItems'}, {node: 'anotherString'}];
    const propDefinition = getPropDefinition(mockComponents, layer, propPath);
    const expected: PropDefinition = {
      type: PropType.String,
      defaultValue: {
        type: PropType.String,
        value: ['default (required)'],
      },
      description: 'A nested string (required)',
      isArrayed: false,
      isRequired: true,
    };
    expect(propDefinition).toEqual(expected);
  });
});

describe('getPropValue', () => {
  it('retrieves a prop value from the first level', () => {
    const layer: Layer = {
      id: 'layer-1',
      title: 'My layer',
      component: 'MyComponent',
      props: {
        primary: {
          type: PropType.Boolean,
          value: [false],
        },
      },
      viewId: 'view-1',
      parent: null,
      repeat: 1,
    };
    const propPath = [{node: 'primary'}];
    const propValue = getPropValue(layer, propPath);
    const expected: PropValue = {
      type: PropType.Boolean,
      value: [false],
    };
    expect(propValue).toEqual(expected);
  });

  it('retrieves a prop value from nested levels', () => {
    const layer: Layer = {
      id: 'layer-1',
      title: 'My layer',
      component: 'MyComponent',
      props: {
        first: {
          type: PropType.Group,
          value: [
            {
              second: {
                type: PropType.String,
                value: ['It works!'],
              },
            },
          ],
        },
      },
      viewId: 'view-1',
      parent: null,
      repeat: 1,
    };
    const propPath: PropPath = [{node: 'first'}, {node: 'second'}];
    const propValue = getPropValue(layer, propPath);
    const expected: PropValue = {
      type: PropType.String,
      value: ['It works!'],
    };
    expect(propValue).toEqual(expected);
  });
});

describe('createReactProps', () => {
  it("converts a layer's prop values into props", () => {
    const layer: Layer = {
      id: 'layer-1',
      title: 'My layer',
      component: 'MyComponent',
      props: {
        singleString: {
          type: PropType.String,
          value: ['Woho, a string'],
        },
        groupedItems: {
          type: PropType.Group,
          value: [
            {
              anotherBoolean: {
                type: PropType.Boolean,
                value: [true],
              },
            },
          ],
        },
      },
      viewId: 'view-1',
      parent: null,
      repeat: 1,
    };
    const secondLayer: Layer = {
      id: 'layer-2',
      title: 'My layer',
      component: 'MyComponent',
      props: {
        singleString: {
          type: PropType.String,
          value: ['Something'],
        },
      },
      viewId: 'view-1',
      parent: {
        layerId: 'layer-1',
        propPath: [{node: 'groupedItems'}, {node: 'anotherReactNode'}],
      },
      repeat: 1,
    };
    const state: State = {
      hoveredLayerId: null,
      layerAdderVisibility: false,
      layers: [layer, secondLayer],
      selectedViewId: 'view-1',
      views: [],
      appState: {
        sheets: [],
      },
    };

    const dispatch = () => undefined;
    const propValue = createReactProps({
      components: mockComponents,
      state,
      dispatch,
      layer,
      propPath: [],
    });
    expect(propValue).toMatchInlineSnapshot(`
      {
        "groupedItems": {
          "anotherBoolean": true,
          "anotherReactNode": [
            <MyComponent
              singleString="Something"
            />,
          ],
          "anotherString": "default (required)",
        },
        "singleString": "Woho, a string",
      }
    `);
  });

  it("handles ReactNodes that don't have a matching child layer", () => {
    const layer: Layer = {
      id: 'layer-1',
      title: 'My layer',
      component: 'MyComponent',
      props: {
        connectedDisclosure: {
          type: PropType.Group,
          value: [
            {
              actions: {
                type: PropType.Group,
                value: [
                  {
                    prefix: {
                      type: PropType.ReactNode,
                      value: [],
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      viewId: 'view-1',
      parent: null,
      repeat: 1,
    };

    const state: State = {
      hoveredLayerId: null,
      layerAdderVisibility: false,
      layers: [layer],
      selectedViewId: 'view-1',
      views: [],
      appState: {
        sheets: [],
      },
    };

    const dispatch = () => undefined;
    const propValue = createReactProps({
      components: mockComponents,
      state,
      dispatch,
      layer,
      propPath: [],
    });
    expect(propValue).toMatchInlineSnapshot(`
      {
        "singleString": "default (required)",
      }
    `);
  });
});

describe('getPropsThatCanHaveChildren', () => {
  it('returns the correct children component', () => {
    const layer: Layer = {
      id: 'layer-1',
      title: 'My layer',
      component: 'MyComponent',
      props: {},
      viewId: 'view-1',
      parent: null,
      repeat: 1,
    };
    const props = getPropsThatCanHaveChildren(mockComponents, layer);
    expect(props).toEqual([
      {
        propPath: [{node: 'singleReactNode'}],
      },
      {
        propPath: [{node: 'arrayedReactNode'}],
      },
      {
        propPath: [{node: 'groupedItems'}, {node: 'anotherReactNode'}],
      },
    ]);
  });
});

describe('insertIntoPropValue', () => {
  it('inserts a prop value into the beginning of a prop value', () => {
    const propValue: PropValue = {
      type: PropType.String,
      value: ['second', 'third'],
    };
    const result = insertIntoPropValue(propValue, 0, 'first');
    const expected: PropValue = {
      type: PropType.String,
      value: ['first', 'second', 'third'],
    };
    expect(result).toEqual(expected);
  });

  it('inserts a prop value into the middle of a prop value', () => {
    const propValue: PropValue = {
      type: PropType.String,
      value: ['first', 'third'],
    };
    const result = insertIntoPropValue(propValue, 1, 'second');
    const expected: PropValue = {
      type: PropType.String,
      value: ['first', 'second', 'third'],
    };
    expect(result).toEqual(expected);
  });

  it('inserts a prop value into the end of a prop value', () => {
    const propValue: PropValue = {
      type: PropType.String,
      value: ['first', 'second'],
    };
    const result = insertIntoPropValue(propValue, 2, 'third');
    const expected: PropValue = {
      type: PropType.String,
      value: ['first', 'second', 'third'],
    };
    expect(result).toEqual(expected);
  });

  it('handles overshooting indices', () => {
    const propValue: PropValue = {
      type: PropType.String,
      value: ['first', 'second'],
    };
    const result = insertIntoPropValue(propValue, 999, 'third');
    const expected: PropValue = {
      type: PropType.String,
      value: ['first', 'second', 'third'],
    };
    expect(result).toEqual(expected);
  });
});

describe('removePropValue', () => {
  it('removes a prop value from the beginning of a prop value', () => {
    const propValue: PropValue = {
      type: PropType.String,
      value: ['first', 'second', 'third'],
    };
    const result = removePropValue(propValue, 0);
    const expected: PropValue = {
      type: PropType.String,
      value: ['second', 'third'],
    };
    expect(result).toEqual(expected);
  });

  it('removes a prop value from the middle of a prop value', () => {
    const propValue: PropValue = {
      type: PropType.String,
      value: ['first', 'second', 'third'],
    };
    const result = removePropValue(propValue, 1);
    const expected: PropValue = {
      type: PropType.String,
      value: ['first', 'third'],
    };
    expect(result).toEqual(expected);
  });

  it('removes a prop value from the end of a prop value', () => {
    const propValue: PropValue = {
      type: PropType.String,
      value: ['first', 'second', 'third'],
    };
    const result = removePropValue(propValue, 2);
    const expected: PropValue = {
      type: PropType.String,
      value: ['first', 'second'],
    };
    expect(result).toEqual(expected);
  });
});

describe('updatePropValue', () => {
  it('updates a prop value', () => {
    const propValue: PropValue = {
      type: PropType.String,
      value: ['first', 'second', 'third'],
    };
    const result = updatePropValue(propValue, 1, 'updated');
    const expected: PropValue = {
      type: PropType.String,
      value: ['first', 'updated', 'third'],
    };
    expect(result).toEqual(expected);
  });

  it('throws an error when the index is out of bounds', () => {
    const propValue: PropValue = {
      type: PropType.String,
      value: ['first', 'second', 'third'],
    };
    const fn = () => updatePropValue(propValue, 999, 'updated');
    expect(fn).toThrow();
  });
});
