---
hideFromNav: true
---

<div as="HowItHelps">

## How it helps merchants

![A labeled diagram of an app settings page layout. The left column is labeled "1" it contains glanceable labels and descriptions. The right column is labeled "2" and contains a list of cards.](/images/patterns/app-settings-cover-image.png)

1. In the left column, glanceable labels and descriptions are listed to make it easier for merchants to scan the page and quickly find what they are looking for.
2. In the right column, settings are grouped in cards to make it easier for merchants to configure a setting after it's been found, or to configure multiple settings that might belong together.

<div as="DefinitionTable">

### Use when merchants need to:

**Find and change app settings**
: This pattern is used specifically for finding and updating individual app settings within the Shopify admin.

</div>
</div>
<div as="Usage">

## Using this pattern

This pattern uses the [`AlphaStack`](/components/alpha-stack), [`AlphaCard`](/components/alpha-card), [`Columns`](/components/columns), and [`Box`](/components/box) components.

```javascript {"type":"previewContext","for":"example"}
<div style={{paddingBottom: '2rem'}}>____CODE____</div>
```

```javascript {"type":"livePreview","id":"example"}
<Page
  divider
  primaryAction={{content: 'View on your store', disabled: true}}
  secondaryActions={[
    {
      content: 'Duplicate',
      accessibilityLabel: 'Secondary action label',
      onAction: () => alert('Duplicate action'),
    },
  ]}
>
  <AlphaStack gap="16" align="center">
    <Columns columns={{xs: '1fr', md: '2fr 5fr'}}>
      <Box
        as="section"
        paddingInlineStart={{xs: 4, sm: 0}}
        paddingInlineEnd={{xs: 2, sm: 0}}
      >
        <AlphaStack>
          <Text as="h3" variant="headingMd">
            InterJambs
          </Text>
          <Text as="p" variant="bodyMd">
            Interjambs are the rounded protruding bits of your puzzlie piece
          </Text>
        </AlphaStack>
      </Box>
      <AlphaCard roundedAbove="sm">
        <AlphaStack fullWidth>
          <TextField label="Interjamb style" />
          <TextField label="Interjamb ratio" />
        </AlphaStack>
      </AlphaCard>
    </Columns>
    <Columns columns={{xs: '1fr', md: '2fr 5fr'}}>
      <Box
        as="section"
        paddingInlineStart={{xs: 2, sm: 0}}
        paddingInlineEnd={{xs: 2, sm: 0}}
      >
        <AlphaStack>
          <Text as="h3" variant="headingMd">
            Dimensions
          </Text>
          <Text as="p" variant="bodyMd">
            Interjambs are the rounded protruding bits of your puzzlie piece
          </Text>
        </AlphaStack>
      </Box>
      <AlphaCard roundedAbove="sm">
        <AlphaStack fullWidth>
          <TextField label="Horizontal" />
          <TextField label="Interjamb ratio" />
        </AlphaStack>
      </AlphaCard>
    </Columns>
  </AlphaStack>
</Page>
```

</div>
<div as="UsefulToKnow">

### Useful to know

|                                                  |                                                |
| ------------------------------------------------ | ---------------------------------------------- |
| Don't include a description unless it's helpful. | ![](/images/patterns/app-settings-usage-1.png) |
| Place grouped settings within cards.             | ![](/images/patterns/app-settings-usage-2.png) |
| Stack all setting groups vertically on the page. | ![](/images/patterns/app-settings-usage-3.png) |

</div>
