import React from 'react';

import {KeyboardKey, Page} from '../src';

export function Playground() {
  return (
    <div style={{background: '#548365', height: '100%', padding: '100px'}}>
      <Page title="Playground">
        <div>
          <KeyboardKey>⌘</KeyboardKey>
          <KeyboardKey>Q</KeyboardKey>
          <KeyboardKey>W</KeyboardKey>
          <KeyboardKey>E</KeyboardKey>
          <KeyboardKey>R</KeyboardKey>
        </div>
        <div>
          <KeyboardKey variant="small">⌘</KeyboardKey>
          <KeyboardKey variant="small">Q</KeyboardKey>
          <KeyboardKey variant="small">W</KeyboardKey>
          <KeyboardKey variant="small">E</KeyboardKey>
          <KeyboardKey variant="small">R</KeyboardKey>
        </div>
      </Page>
    </div>
  );
}
