# Migrating from v10 to v11

Polaris v11.0.0 ([full release notes](https://github.com/Shopify/polaris/releases/tag/v11.0.0)) features...

## Table of Contents

- [Node support](#node-support)
- [Components](#components)
  - [Removed deprecated Collapsible argument](#removed-deprecated-collapsible-argument)
  - [Removed KonamiCode component](#removed-konamicode-component)
- [Tokens](#tokens)

## Node support

NodeJS version 14 is no longer supported. NodeJS 18 is recommended and 16 is the minimum supported version.

## Components

### Removed deprecated Collapsible argument

We've removed the following deprecated prop from the Collapsible component:

`- preventMeasuringOnChildrenUpdate?: boolean;`

### Removed KonamiCode component

We are removing low usage components from Polaris. We love fun but we also want to ensure we are shipping exactly what our users need. If you want to use this in your project feel free to copy the [component sourcecode](https://github.com/Shopify/polaris/blob/%40shopify/polaris%4010.24.0/polaris-react/src/components/KonamiCode/KonamiCode.tsx).

## Tokens