import React from 'react';

import {classNames} from '../../utilities/css';

import styles from './KeyboardKey.scss';

type Variant = 'small';

export interface KeyboardKeyProps {
  children?: string;
  variant?: Variant;
}
export function KeyboardKey({children, variant}: KeyboardKeyProps) {
  let key = children || '';
  key = key.length > 1 ? key.toLowerCase() : key.toUpperCase();

  const className = classNames(styles.KeyboardKey, variant && styles[variant]);

  return <kbd className={className}>{key}</kbd>;
}
