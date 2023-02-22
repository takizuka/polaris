import React from 'react';

import {classNames} from '../../utilities/css';

import styles from './KeyboardKey.scss';

type Size = 'small';

export interface KeyboardKeyProps {
  children?: string;
  size?: Size;
}
export function KeyboardKey({children, size}: KeyboardKeyProps) {
  let key = children || '';
  key = size || key.length > 1 ? key.toLowerCase() : key.toUpperCase();

  const className = classNames(styles.KeyboardKey, size && styles[size]);

  return <kbd className={className}>{key}</kbd>;
}
