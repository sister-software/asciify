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
- [LuminanceCharacterCodeMap](../wiki/LuminanceCharacterCodeMap)

### Configuration Interfaces

- [AsciifyOptions](../wiki/AsciifyOptions)

### Helper Functions

- [readFromCanvas](../wiki/Home#readfromcanvas)
- [readFromImage](../wiki/Home#readfromimage)
- [readFromVideo](../wiki/Home#readfromvideo)

### Configuration Variables

- [DEFAULT\_CHAR\_SET](../wiki/Home#default_char_set)

### Configuration Type Aliases

- [ASCIIMode](../wiki/Home#asciimode)

### Other Type Aliases

- [Canvas2dContextLike](../wiki/Home#canvas2dcontextlike)
- [CanvasLike](../wiki/Home#canvaslike)
- [CharacterCoords](../wiki/Home#charactercoords)

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

[readers.mts:28](https://github.com/sister-software/asciify/blob/9750ae3/readers.mts#L28)

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
| `sourceImage` | `ImageBitmapSource` | The image to read pixels from. This will be resized to match the next given `canvas` argument. |
| `ctx` | [`Canvas2dContextLike`](../wiki/Home#canvas2dcontextlike) | The 2D context to read from. Make sure to provide a canvas with the same dimensions as the asciify instance you're using. **`See`** [`setSize`](../wiki/Asciify#setsize) |

#### Returns

`Promise`<`Uint8ClampedArray`\>

#### Defined in

[readers.mts:51](https://github.com/sister-software/asciify/blob/9750ae3/readers.mts#L51)

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
| `canvas` | [`CanvasLike`](../wiki/Home#canvaslike) | A canvas to use for reading the video. You should provide this parameter if you'd like to cache the canvas. |

#### Returns

`Uint8ClampedArray`

A Uint8ClampedArray containing the RGBA pixel buffer

#### Defined in

[readers.mts:90](https://github.com/sister-software/asciify/blob/9750ae3/readers.mts#L90)

## Configuration Variables

### DEFAULT\_CHAR\_SET

• `Const` **DEFAULT\_CHAR\_SET**: `string`[]

A default character set to use for the ASCII art.
This looks good with both black and white and color output.

#### Defined in

[configuration.mts:20](https://github.com/sister-software/asciify/blob/9750ae3/configuration.mts#L20)

## Configuration Type Aliases

### ASCIIMode

Ƭ **ASCIIMode**: ``"grayscale"`` \| ``"color"`` \| ``"block"``

The fill style mode used to paint the canvas.

#### Defined in

[configuration.mts:26](https://github.com/sister-software/asciify/blob/9750ae3/configuration.mts#L26)

___

## Other Type Aliases

### Canvas2dContextLike

Ƭ **Canvas2dContextLike**: `OffscreenCanvasRenderingContext2D` \| `CanvasRenderingContext2D`

Either a canvas 2D context or an offscreen canvas 2D context.
Note that the offscreen canvas support varies between browsers.
Safari tends to produce slight visual artifacts when using offscreen canvases.

**`See`**

[MDN on Offscreen Canvas 2D Context](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvasRenderingContext2D)

#### Defined in

[utils.mts:28](https://github.com/sister-software/asciify/blob/9750ae3/utils.mts#L28)

___

### CanvasLike

Ƭ **CanvasLike**: `OffscreenCanvas` \| `HTMLCanvasElement`

Either a canvas or an offscreen canvas.
Note that the offscreen canvas support varies between browsers.
Safari tends to produce slight visual artifacts when using offscreen canvases.

**`See`**

[MDN on Offscreen Canvas](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas)

#### Defined in

[utils.mts:19](https://github.com/sister-software/asciify/blob/9750ae3/utils.mts#L19)

___

### CharacterCoords

Ƭ **CharacterCoords**: `Map`<`number`, [`number`, `number`]\>

#### Defined in

[utils.mts:217](https://github.com/sister-software/asciify/blob/9750ae3/utils.mts#L217)
