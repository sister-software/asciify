# Asciify by Sister Software

**`Fileoverview`**

This file is the entry point for the @sister.software/asciify module.

**`See`**

[API documentation](https://sister.software/asciify)

**`Copyright`**

Sister Software. All rights reserved.

**`License`**

MIT

**`Author`**

Teffen Ellis

## Table of contents

### Main Classes

- [Asciify](../wiki/Asciify)

### Other Classes

- [FrameBuffer](../wiki/FrameBuffer)
- [TextureCache](../wiki/TextureCache)

### Utility Classes

- [LookupTable](../wiki/LookupTable)
- [LuminanceCharacterMap](../wiki/LuminanceCharacterMap)

### Configuration Interfaces

- [AsciifyOptions](../wiki/AsciifyOptions)

### Other Interfaces

- [TextureMetrics](../wiki/TextureMetrics)

### Helper Functions

- [readFromCanvas](../wiki/Home#readfromcanvas)
- [readFromImage](../wiki/Home#readfromimage)
- [readFromVideo](../wiki/Home#readfromvideo)

### Other Functions

- [calculateTextureMetrics](../wiki/Home#calculatetexturemetrics)
- [normalizeNumericOption](../wiki/Home#normalizenumericoption)

### Configuration Variables

- [OptionPresets](../wiki/Home#optionpresets)

### Other Variables

- [DEFAULT\_CHARACTER\_SET](../wiki/Home#default_character_set)
- [DEFAULT\_CONTRAST\_RATIO](../wiki/Home#default_contrast_ratio)
- [DEFAULT\_FONT\_SIZE](../wiki/Home#default_font_size)
- [DEFAULT\_PIXEL\_RATIO](../wiki/Home#default_pixel_ratio)

### Type Aliases

- [Canvas2dContextLike](../wiki/Home#canvas2dcontextlike)
- [CanvasLike](../wiki/Home#canvaslike)
- [CharacterCoords](../wiki/Home#charactercoords)
- [PixelIndex](../wiki/Home#pixelindex)
- [WithStringlyNumbers](../wiki/Home#withstringlynumbers)

## Helper Functions

### readFromCanvas

▸ **readFromCanvas**(`ctx`): `Uint8ClampedArray`

Reads the pixel buffer from a canvas element.
This function is useful when you want to rasterize an existing canvas to ASCII art.

**`See`**

 - [`rasterize`](../wiki/Asciify#rasterize)
 - [`readFromImage`](../wiki/Home#readfromimage)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `ctx` | [`Canvas2dContextLike`](../wiki/Home#canvas2dcontextlike) | The 2D context to read from. Make sure to provide a canvas with the same dimensions as the asciify instance you're using. **`See`** [`setSize`](../wiki/Asciify#setsize) |

#### Returns

`Uint8ClampedArray`

#### Defined in

[utils/readers.mts:28](https://github.com/sister-software/asciify/blob/f11c4e8/utils/readers.mts#L28)

___

### readFromImage

▸ **readFromImage**(`sourceImage`, `ctx`): `Promise`<`Uint8ClampedArray`\>

Reads the pixel buffer from an image element.
This function is useful when you want to rasterize an image to ASCII art.

**`See`**

 - [`rasterize`](../wiki/Asciify#rasterize)
 - [`readFromCanvas`](../wiki/Home#readfromcanvas)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `sourceImage` | `CanvasImageSource` | The image to read pixels from. This will be resized to match the next given `canvas` argument. |
| `ctx` | [`Canvas2dContextLike`](../wiki/Home#canvas2dcontextlike) | The 2D context to read from. Make sure to provide a canvas with the same dimensions as the asciify instance you're using. **`See`** [`setSize`](../wiki/Asciify#setsize) |

#### Returns

`Promise`<`Uint8ClampedArray`\>

#### Defined in

[utils/readers.mts:51](https://github.com/sister-software/asciify/blob/f11c4e8/utils/readers.mts#L51)

___

### readFromVideo

▸ **readFromVideo**(`video`, `canvas?`): `Uint8ClampedArray`

Reads the pixel buffer from a video element.
This function is useful when you want to rasterize a video to ASCII art.

**`See`**

 - [`rasterize`](../wiki/Asciify#rasterize)
 - [`readFromCanvas`](../wiki/Home#readfromcanvas)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `video` | `HTMLVideoElement` | The video to read pixels from. **`See`** - [MDN on HTMLVideoElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement) - [MDN on HTMLMediaElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement) - [MDN on Media captureStream](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/captureStream) - [MDN on Canvas captureStream](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/captureStream) |
| `canvas` | [`CanvasLike`](../wiki/Home#canvaslike) | A canvas to use for reading the video. You should provide this parameter if you'd like to cache the canvas. **`Optional`** |

#### Returns

`Uint8ClampedArray`

A Uint8ClampedArray containing the RGBA pixel buffer

#### Defined in

[utils/readers.mts:91](https://github.com/sister-software/asciify/blob/f11c4e8/utils/readers.mts#L91)

___

## Other Functions

### calculateTextureMetrics

▸ **calculateTextureMetrics**(`fontSize`, `pixelRatio`): [`TextureMetrics`](../wiki/TextureMetrics)

**`Internel`**

#### Parameters

| Name | Type |
| :------ | :------ |
| `fontSize` | `number` |
| `pixelRatio` | `number` |

#### Returns

[`TextureMetrics`](../wiki/TextureMetrics)

#### Defined in

[utils/TextureCache.mts:117](https://github.com/sister-software/asciify/blob/f11c4e8/utils/TextureCache.mts#L117)

___

### normalizeNumericOption

▸ **normalizeNumericOption**(`min`, `value`, `max`): `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `min` | `number` |
| `value` | `string` \| `number` |
| `max` | `number` |

#### Returns

`number`

#### Defined in

[options/common.mts:130](https://github.com/sister-software/asciify/blob/f11c4e8/options/common.mts#L130)

## Configuration Variables

### OptionPresets

• `Const` **OptionPresets**: `Object`

A collection of ready-made character presets.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `ascii` | { `characterSet`: `string` = DEFAULT\_CHARACTER\_SET } | A default character set to use for the ASCII art. This looks good with both black and white and color output. |
| `ascii.characterSet` | `string` | - |
| `asterisks` | { `characterSet`: `string` ; `characterSpacingRatio`: `number` = 1.5; `contrastRatio`: `number` = 2; `fontSize`: `number` = 8 } | - |
| `asterisks.characterSet` | `string` | - |
| `asterisks.characterSpacingRatio` | `number` | - |
| `asterisks.contrastRatio` | `number` | - |
| `asterisks.fontSize` | `number` | - |
| `blocks` | { `characterSet`: `string`  } | A richer character set made of dithered blocks. |
| `blocks.characterSet` | `string` | - |
| `chess` | { `characterSet`: `string` ; `characterSpacingRatio`: `number` = 1; `contrastRatio`: `number` = 0; `fontSize`: `number` = 12 } | - |
| `chess.characterSet` | `string` | - |
| `chess.characterSpacingRatio` | `number` | - |
| `chess.contrastRatio` | `number` | - |
| `chess.fontSize` | `number` | - |
| `circles` | { `characterSet`: `string` ; `characterSpacingRatio`: `number` = 1; `contrastRatio`: `number` = 2 } | A character set made of circular shapes. |
| `circles.characterSet` | `string` | - |
| `circles.characterSpacingRatio` | `number` | - |
| `circles.contrastRatio` | `number` | - |
| `diamonds` | { `characterSet`: `string` ; `characterSpacingRatio`: `number` = 1; `contrastRatio`: `number` = 2 } | A character set made of diamond shapes. |
| `diamonds.characterSet` | `string` | - |
| `diamonds.characterSpacingRatio` | `number` | - |
| `diamonds.contrastRatio` | `number` | - |
| `faces` | { `characterSet`: `string` = '🫥😶😑😐😏😵🤩'; `contrastRatio`: `number` = 0 } | - |
| `faces.characterSet` | `string` | - |
| `faces.contrastRatio` | `number` | - |
| `hands` | { `characterSet`: `string` ; `contrastRatio`: `number` = 0; `fontFamily`: `string`  } | - |
| `hands.characterSet` | `string` | - |
| `hands.contrastRatio` | `number` | - |
| `hands.fontFamily` | `string` | - |
| `numerals` | { `characterSet`: `string` ; `characterSpacingRatio`: `number` = 1; `contrastRatio`: `number` = 0; `fontSize`: `number` = 20 } | A character set made of numerals. |
| `numerals.characterSet` | `string` | - |
| `numerals.characterSpacingRatio` | `number` | - |
| `numerals.contrastRatio` | `number` | - |
| `numerals.fontSize` | `number` | - |
| `squares` | { `characterSet`: `string`  } | A character set made of squares. |
| `squares.characterSet` | `string` | - |
| `stacks` | { `characterSet`: `string`  } | A character set made of dithered stacks. |
| `stacks.characterSet` | `string` | - |
| `thin` | { `characterSet`: `string`  } | A character set made of thin blocks. |
| `thin.characterSet` | `string` | - |

#### Defined in

[options/presets.mts:14](https://github.com/sister-software/asciify/blob/f11c4e8/options/presets.mts#L14)

___

## Other Variables

### DEFAULT\_CHARACTER\_SET

• `Const` **DEFAULT\_CHARACTER\_SET**: ``"..,'\":;-~=+*#&%@"``

#### Defined in

[options/common.mts:121](https://github.com/sister-software/asciify/blob/f11c4e8/options/common.mts#L121)

___

### DEFAULT\_CONTRAST\_RATIO

• `Const` **DEFAULT\_CONTRAST\_RATIO**: ``3``

#### Defined in

[options/common.mts:120](https://github.com/sister-software/asciify/blob/f11c4e8/options/common.mts#L120)

___

### DEFAULT\_FONT\_SIZE

• `Const` **DEFAULT\_FONT\_SIZE**: ``12``

#### Defined in

[options/common.mts:119](https://github.com/sister-software/asciify/blob/f11c4e8/options/common.mts#L119)

___

### DEFAULT\_PIXEL\_RATIO

• `Const` **DEFAULT\_PIXEL\_RATIO**: `number`

#### Defined in

[options/common.mts:118](https://github.com/sister-software/asciify/blob/f11c4e8/options/common.mts#L118)

## Type Aliases

### Canvas2dContextLike

Ƭ **Canvas2dContextLike**: `OffscreenCanvasRenderingContext2D` \| `CanvasRenderingContext2D`

Either a canvas 2D context or an offscreen canvas 2D context.
Note that the offscreen canvas support varies between browsers.
Safari tends to produce slight visual artifacts when using offscreen canvases.

**`See`**

[MDN on Offscreen Canvas 2D Context](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvasRenderingContext2D)

#### Defined in

[utils/canvas.mts:28](https://github.com/sister-software/asciify/blob/f11c4e8/utils/canvas.mts#L28)

___

### CanvasLike

Ƭ **CanvasLike**: `OffscreenCanvas` \| `HTMLCanvasElement`

Either a canvas or an offscreen canvas.
Note that the offscreen canvas support varies between browsers.
Safari tends to produce slight visual artifacts when using offscreen canvases.

**`See`**

[MDN on Offscreen Canvas](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas)

#### Defined in

[utils/canvas.mts:19](https://github.com/sister-software/asciify/blob/f11c4e8/utils/canvas.mts#L19)

___

### CharacterCoords

Ƭ **CharacterCoords**: `Map`<`number`, [`number`, `number`]\>

#### Defined in

[utils/LookupTable.mts:1](https://github.com/sister-software/asciify/blob/f11c4e8/utils/LookupTable.mts#L1)

___

### PixelIndex

Ƭ **PixelIndex**: `Uint32Array`

#### Defined in

[utils/LookupTable.mts:3](https://github.com/sister-software/asciify/blob/f11c4e8/utils/LookupTable.mts#L3)

___

### WithStringlyNumbers

Ƭ **WithStringlyNumbers**<`T`\>: { [P in keyof T]: T[P] extends number ? T[P] \| string : T[P] }

Type utility that allows number properties to be strings. Useful for accepting form inputs.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Defined in

[options/common.mts:126](https://github.com/sister-software/asciify/blob/f11c4e8/options/common.mts#L126)
