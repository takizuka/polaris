import type {FileInfo, API} from 'jscodeshift';

import stylesReplaceCustomProperty from '../styles-replace-custom-property/styles-replace-custom-property';

const replacementMaps = {
  '/.+/': {
    '--p-border-radius-base': '--p-border-radius-1',
    '--p-border-radius-large': '--p-border-radius-2',
    '--p-border-radius-half': '--p-border-radius-full',
  },
};

export default function v11StylesReplaceCustomPropertyBorder(
  fileInfo: FileInfo,
  _: API,
) {
  return stylesReplaceCustomProperty(fileInfo, _, {replacementMaps});
}
