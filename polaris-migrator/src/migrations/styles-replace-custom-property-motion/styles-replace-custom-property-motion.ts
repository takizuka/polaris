import type {FileInfo, API} from 'jscodeshift';

import stylesReplaceCustomProperty from '../styles-replace-custom-property/styles-replace-custom-property';

const replacementMaps = {
  '/.+/': {
    '--p-duration-1-0-0': '--p-duration-100',
    '--p-duration-1-5-0': '--p-duration-150',
    '--p-duration-0': '0',
  },
};

export default function stylesReplaceCustomPropertyMotion(
  fileInfo: FileInfo,
  _: API,
) {
  return stylesReplaceCustomProperty(fileInfo, _, {replacementMaps});
}
