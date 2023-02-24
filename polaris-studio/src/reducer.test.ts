import {reducer} from './reducer';
import {Action, PropType, State} from './types';

const initialStateWithoutLayers: State = {
  hoveredLayerId: null,
  layers: [],
  views: [
    {
      id: 'view-1',
      name: 'Index',
      selectedLayerId: null,
      type: 'View',
    },
  ],
  selectedViewId: 'a',
  layerAdderVisibility: false,
  appState: {
    sheets: [],
  },
};

describe('reducer', () => {
  describe('SET_PROPS', () => {
    it('sets the props of a previously set, nonarrayed prop at index 0', () => {
      const state: State = {
        ...initialStateWithoutLayers,
        layers: [
          {
            id: 'layer-1',
            title: 'Button layer',
            component: 'Button',
            parent: null,
            repeat: 1,
            viewId: 'view-1',
            props: {
              children: {
                type: PropType.String,
                value: ['Button'],
              },
            },
          },
        ],
      };

      const action: Action = {
        type: 'SET_PROP',
        propPath: [{node: 'children'}],
        layerId: 'layer-1',
        value: {
          type: PropType.String,
          value: ['New button value'],
        },
        index: 0,
      };
      const newState = reducer(state, action);
      const layer = newState.layers.find((layer) => layer.id === 'layer-1');
      expect(layer?.props['children']).toEqual({
        type: PropType.String,
        value: ['New button value'],
      });
    });

    it('sets the props of a unset, nonarrayed prop at index 0', () => {
      const state: State = {
        ...initialStateWithoutLayers,
        layers: [
          {
            id: 'layer-1',
            title: 'Button layer',
            component: 'Button',
            parent: null,
            repeat: 1,
            viewId: 'view-1',
            props: {},
          },
        ],
      };

      const action: Action = {
        type: 'SET_PROP',
        propPath: [{node: 'children'}],
        layerId: 'layer-1',
        value: {
          type: PropType.String,
          value: ['New button value'],
        },
        index: 0,
      };
      const newState = reducer(state, action);
      const layer = newState.layers.find((layer) => layer.id === 'layer-1');
      expect(layer?.props['children']).toEqual({
        type: PropType.String,
        value: ['New button value'],
      });
    });

    it('sets the props of a previously set, prop at index 0 that is inside an arrayed group', () => {
      const state: State = {
        ...initialStateWithoutLayers,
        layers: [
          {
            id: 'layer-1',
            title: 'Button layer',
            component: 'Button',
            parent: null,
            repeat: 1,
            viewId: 'view-1',
            props: {
              connectedDisclosure: {
                type: PropType.Group,
                value: [
                  {
                    // The arrayed group
                    actions: {
                      type: PropType.Group,
                      value: [
                        {
                          active: {
                            type: PropType.Boolean,
                            value: [true],
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
          },
        ],
      };

      const action: Action = {
        type: 'SET_PROP',
        propPath: [
          {node: 'connectedDisclosure'},
          {node: 'actions'},
          {node: 'active'},
        ],
        layerId: 'layer-1',
        value: {
          type: PropType.Boolean,
          value: [false],
        },
        index: 0,
      };
      const newState = reducer(state, action);
      const layer = newState.layers.find((layer) => layer.id === 'layer-1');
      expect(layer?.props['connectedDisclosure']).toMatchInlineSnapshot(`
        {
          "type": "group",
          "value": [
            {
              "actions": {
                "type": "group",
                "value": [
                  {
                    "active": {
                      "type": "boolean",
                      "value": [
                        false,
                      ],
                    },
                  },
                ],
              },
            },
          ],
        }
      `);
    });

    it('sets the props of a previously set, prop at index 0 that is the second item in an arrayed group', () => {
      const state: State = {
        ...initialStateWithoutLayers,
        layers: [
          {
            id: 'layer-1',
            title: 'Button layer',
            component: 'Button',
            parent: null,
            repeat: 1,
            viewId: 'view-1',
            props: {
              connectedDisclosure: {
                type: PropType.Group,
                value: [
                  {
                    actions: {
                      type: PropType.Group,
                      value: [
                        {
                          active: {
                            type: PropType.Boolean,
                            value: [true],
                          },
                        },
                        // A second Action — the one we want to update
                        {
                          active: {
                            type: PropType.Boolean,
                            value: [true],
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
          },
        ],
      };

      const action: Action = {
        type: 'SET_PROP',
        propPath: [
          {node: 'connectedDisclosure'},
          {node: 'actions', index: 1},
          {node: 'active', index: 0},
        ],
        layerId: 'layer-1',
        value: {
          type: PropType.Boolean,
          value: [false],
        },
        index: 0,
      };
      const newState = reducer(state, action);
      const layer = newState.layers.find((layer) => layer.id === 'layer-1');
      expect(layer?.props['connectedDisclosure']).toMatchInlineSnapshot(`
        {
          "type": "group",
          "value": [
            {
              "actions": {
                "type": "group",
                "value": [
                  {
                    "active": {
                      "type": "boolean",
                      "value": [
                        true,
                      ],
                    },
                  },
                  {
                    "active": {
                      "type": "boolean",
                      "value": [
                        false,
                      ],
                    },
                  },
                ],
              },
            },
          ],
        }
      `);
    });

    it('throws an error when the index is out of bounds', () => {
      const state: State = {
        ...initialStateWithoutLayers,
        layers: [
          {
            id: 'layer-1',
            title: 'Button layer',
            component: 'Button',
            parent: null,
            repeat: 1,
            viewId: 'view-1',
            props: {
              children: {
                type: PropType.String,
                value: ['Button'],
              },
            },
          },
        ],
      };
      const action: Action = {
        type: 'SET_PROP',
        propPath: [{node: 'children'}],
        layerId: 'layer-1',
        value: {
          type: PropType.String,
          value: ['First'],
        },
        index: 1,
      };
      const fn = () => reducer(state, action);
      expect(fn).toThrow();
    });
  });
});
