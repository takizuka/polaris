import * as polaris from '@shopify/polaris';
import {ComponentMap, PropDefinition, PropType} from './types';
import untypedComponents from './componentProps.json';
import {createElement} from 'react';
import get from 'lodash.get';

interface PropMap {
  [reactPropsName: string]: {
    [prop: string]: PropDefinition;
  };
}

let importedProps = untypedComponents as PropMap;

export let components: ComponentMap = {};

Object.entries(importedProps).forEach(([reactPropsName, props]) => {
  const componentName = reactPropsName.replace('Props', '');

  const polarisReactComponent = get(
    polaris,
    componentName as keyof typeof polaris,
  );

  if (!polarisReactComponent) {
    delete components[componentName];
  } else {
    components[componentName] = {
      reactComponent: polarisReactComponent,
      renderPreview: () =>
        createElement('div', {}, [`${componentName} preview`]),
      props,
    };
  }
});

components['p'] = {
  reactComponent: (props: any) => createElement('p', props),
  props: {
    children: {
      type: PropType.String,
      alias: 'Text',
      description: 'The label of the button',
      defaultValue: {
        type: PropType.String,
        value: 'Lorem ipsum dolor et amet',
      },
    },
  },
  renderPreview: () => <p>Paragraph</p>,
};
