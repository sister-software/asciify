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

- [IndexLookupTable](../wiki/IndexLookupTable)

### Interfaces

- [AsciifyOptions](../wiki/AsciifyOptions)

### Helper Functions

- [readFromCanvas](../wiki/Home#readfromcanvas)
- [readFromImage](../wiki/Home#readfromimage)
- [readFromThree](../wiki/Home#readfromthree)
- [readFromVideo](../wiki/Home#readfromvideo)

### Utility Functions

- [createCharacterCodeRadix](../wiki/Home#createcharactercoderadix)
- [createIndexLookupTable](../wiki/Home#createindexlookuptable)

### Character Set Variables

- [DEFAULT\_BW\_CHAR\_LIST](../wiki/Home#default_bw_char_list)
- [DEFAULT\_CHAR\_SET](../wiki/Home#default_char_set)
- [DEFAULT\_COLOR\_CHAR\_LIST](../wiki/Home#default_color_char_list)

### Type Aliases

- [ASCIIMode](../wiki/Home#asciimode)
- [Canvas2dContextLike](../wiki/Home#canvas2dcontextlike)
- [CanvasLike](../wiki/Home#canvaslike)

## Helper Functions

### readFromCanvas

▸ **readFromCanvas**(`ctx`): `Uint8ClampedArray`

Reads the pixel buffer from a canvas element.
This function is useful when you want to rasterize an existing canvas to ASCII art.

**`See`**

 - [`rasterize`](../wiki/Asciify#rasterize)
 - [`readFromThree`](../wiki/Home#readfromthree)
 - [`readFromImage`](../wiki/Home#readfromimage)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `ctx` | [`Canvas2dContextLike`](../wiki/Home#canvas2dcontextlike) | The 2D context to read from. Make sure to provide a canvas with the same dimensions as the asciify instance you're using. **`See`** [`setSize`](../wiki/Asciify#setsize) |

#### Returns

`Uint8ClampedArray`

#### Defined in

[readers.mts:48](https://github.com/sister-software/asciify/blob/836ead9/readers.mts#L48)

___

### readFromImage

▸ **readFromImage**(`sourceImage`, `ctx`): `Promise`<`Uint8ClampedArray`\>

Reads the pixel buffer from an image element.
This function is useful when you want to rasterize an image to ASCII art.

**`See`**

 - [`rasterize`](../wiki/Asciify#rasterize)
 - [`readFromThree`](../wiki/Home#readfromthree)
 - [`readFromCanvas`](../wiki/Home#readfromcanvas)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `sourceImage` | `ImageBitmapSource` | The image to read pixels from. This will be resized to match the next given `canvas` argument. |
| `ctx` | [`Canvas2dContextLike`](../wiki/Home#canvas2dcontextlike) | The 2D context to read from. Make sure to provide a canvas with the same dimensions as the asciify instance you're using. **`See`** [`setSize`](../wiki/Asciify#setsize) |

#### Returns

`Promise`<`Uint8ClampedArray`\>

#### Defined in

[readers.mts:72](https://github.com/sister-software/asciify/blob/836ead9/readers.mts#L72)

___

### readFromThree

▸ **readFromThree**(`renderer`, `ctx?`): `Uint8ClampedArray`

Read the pixel buffer from a ThreeJS WebGLRenderer.
This function is useful when you want to render a ThreeJS scene to ASCII art.

**`See`**

[`rasterizeThree`](../wiki/Asciify#rasterizethree)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `renderer` | `WebGLRenderer` | The Three.js renderer to read from. |
| `ctx` | `WebGLRenderingContext` \| `WebGL2RenderingContext` | The WebGL context to read from. Defaults to the context of the renderer. You should provide this if you'd like to cache the context once and reuse it. |

#### Returns

`Uint8ClampedArray`

A Uint8ClampedArray containing the RGBA pixel buffer

#### Defined in

[readers.mts:22](https://github.com/sister-software/asciify/blob/836ead9/readers.mts#L22)

___

### readFromVideo

▸ **readFromVideo**(`video`, `canvas?`): `Uint8ClampedArray`

Reads the pixel buffer from a video element.
This function is useful when you want to rasterize a video to ASCII art.

**`See`**

 - [`rasterize`](../wiki/Asciify#rasterize)
 - [`readFromThree`](../wiki/Home#readfromthree)
 - [`readFromCanvas`](../wiki/Home#readfromcanvas)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `video` | `HTMLVideoElement` | The video to read pixels from. **`See`** - [MDN on HTMLVideoElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement) - [MDN on HTMLMediaElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement) - [MDN on Media captureStream](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/captureStream) - [MDN on Canvas captureStream](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/captureStream) |
| `canvas` | [`CanvasLike`](../wiki/Home#canvaslike) | A canvas to use for reading the video. You should provide this parameter if you'd like to cache the canvas. |

#### Returns

`Uint8ClampedArray`

A Uint8ClampedArray containing the RGBA pixel buffer

#### Defined in

[readers.mts:112](https://github.com/sister-software/asciify/blob/836ead9/readers.mts#L112)

___

## Utility Functions

### createCharacterCodeRadix

▸ **createCharacterCodeRadix**(`asciiCharacters`): `Uint16Array`

Given an array of 255 or less ASCII characters representing the brightness of each pixel,
returns something like a radix-sorted array of 255 characters that are evenly spaced.

This helps us avoid expensive operations like Math.floor() when rendering the ASCII art.

**`See`**

[`TypedOptimization::TryBuildCharacterCodeRadix`](https://github.com/v8/v8/blob/b584c57/src/compiler/typed-optimization.cc#L471)

#### Parameters

| Name | Type |
| :------ | :------ |
| `asciiCharacters` | `string`[] |

#### Returns

`Uint16Array`

#### Defined in

[utils.mts:107](https://github.com/sister-software/asciify/blob/836ead9/utils.mts#L107)

___

### createIndexLookupTable

▸ **createIndexLookupTable**(`rowCount`, `columnCount`, `fontSize`, `lineHeight`): [`IndexLookupTable`](../wiki/IndexLookupTable)[]

Creates a precomputed lookup table for a given pixel buffer.

This is used to avoid expensive and repetitive calculations when rendering the ASCII art.
The lookup table is a Uint16Array containing pairs of six values:

- The x coordinate of the character cell
- The y coordinate of the character cell
- The index of the red channel from the pixel buffer
- The index of the green channel from the pixel buffer
- The index of the blue channel from the pixel buffer
- The index of the alpha channel from the pixel buffer

#### Parameters

| Name | Type |
| :------ | :------ |
| `rowCount` | `number` |
| `columnCount` | `number` |
| `fontSize` | `number` |
| `lineHeight` | `number` |

#### Returns

[`IndexLookupTable`](../wiki/IndexLookupTable)[]

#### Defined in

[utils.mts:175](https://github.com/sister-software/asciify/blob/836ead9/utils.mts#L175)

## Character Set Variables

### DEFAULT\_BW\_CHAR\_LIST

• `Const` **DEFAULT\_BW\_CHAR\_LIST**: `string`[]

A default character set to use for the ASCII art.
Optimized for black and white output.

#### Defined in

[options.mts:30](https://github.com/sister-software/asciify/blob/836ead9/options.mts#L30)

___

### DEFAULT\_CHAR\_SET

• `Const` **DEFAULT\_CHAR\_SET**: `string`[]

A default character set to use for the ASCII art.
More spaces will result in a more contrast ASCII art.
This looks good with both black and white and color output.

**`See`**

 - [`DEFAULT_BW_CHAR_LIST`](../wiki/Home#default_bw_char_list)
 - [`DEFAULT_COLOR_CHAR_LIST`](../wiki/Home#default_color_char_list)

#### Defined in

[options.mts:23](https://github.com/sister-software/asciify/blob/836ead9/options.mts#L23)

___

### DEFAULT\_COLOR\_CHAR\_LIST

• `Const` **DEFAULT\_COLOR\_CHAR\_LIST**: `string`[]

A default character set to use for the ASCII art.
Optimized for richer color output.

#### Defined in

[options.mts:37](https://github.com/sister-software/asciify/blob/836ead9/options.mts#L37)

## Type Aliases

### ASCIIMode

Ƭ **ASCIIMode**: ``"grayscale"`` \| ``"color"`` \| ``"block"``

The fill style mode used to paint the canvas.

#### Defined in

[options.mts:42](https://github.com/sister-software/asciify/blob/836ead9/options.mts#L42)

___

### Canvas2dContextLike

Ƭ **Canvas2dContextLike**: `OffscreenCanvasRenderingContext2D` \| `CanvasRenderingContext2D`

Either a canvas 2D context or an offscreen canvas 2D context.
Note that the offscreen canvas support varies between browsers.
Safari tends to produce slight visual artifacts when using offscreen canvases.

**`See`**

[MDN on Offscreen Canvas 2D Context](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvasRenderingContext2D)

#### Defined in

[utils.mts:28](https://github.com/sister-software/asciify/blob/836ead9/utils.mts#L28)

___

### CanvasLike

Ƭ **CanvasLike**: `OffscreenCanvas` \| `HTMLCanvasElement`

Either a canvas or an offscreen canvas.
Note that the offscreen canvas support varies between browsers.
Safari tends to produce slight visual artifacts when using offscreen canvases.

**`See`**

[MDN on Offscreen Canvas](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas)

#### Defined in

[utils.mts:19](https://github.com/sister-software/asciify/blob/836ead9/utils.mts#L19)
