[@sister.software/asciify](Home.md) / Exports

# Asciify by Sister Software

## Table of contents

### Main Classes

- [Asciify](classes/Asciify.md)

### Interfaces

- [AsciifyOptions](interfaces/AsciifyOptions.md)

### Helper Functions

- [readFromCanvas](modules.md#readfromcanvas)
- [readFromImage](modules.md#readfromimage)
- [readFromThreeJS](modules.md#readfromthreejs)
- [readFromVideo](modules.md#readfromvideo)

### Utility Functions

- [createCharacterCodeRadix](modules.md#createcharactercoderadix)

### Character Set Variables

- [DEFAULT\_BW\_CHAR\_LIST](modules.md#default_bw_char_list)
- [DEFAULT\_CHAR\_SET](modules.md#default_char_set)
- [DEFAULT\_COLOR\_CHAR\_LIST](modules.md#default_color_char_list)

### Type Aliases

- [ASCIIMode](modules.md#asciimode)
- [Canvas2dContextLike](modules.md#canvas2dcontextlike)
- [CanvasLike](modules.md#canvaslike)

## Helper Functions

### readFromCanvas

▸ **readFromCanvas**(`canvas`, `ctx?`): `Uint8ClampedArray`

Reads the pixel buffer from a canvas element.
This function is useful when you want to rasterize an existing canvas to ASCII art.

**`See`**

 - [`rasterize`](classes/Asciify.md#rasterize)
 - [`readFromThreeJS`](modules.md#readfromthreejs)
 - [`readFromImage`](modules.md#readfromimage)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `canvas` | [`CanvasLike`](modules.md#canvaslike) | The canvas to read from. |
| `ctx` | [`Canvas2dContextLike`](modules.md#canvas2dcontextlike) | The 2D context to read from. You should provide this parameter if you'd like to cache the context, or provide a context optimized for your content. |

#### Returns

`Uint8ClampedArray`

#### Defined in

[mod.mts:431](https://github.com/sister-software/asciify/blob/5168fb7/mod.mts#L431)

___

### readFromImage

▸ **readFromImage**(`image`, `canvas?`, `ctx?`): `Uint8ClampedArray`

Reads the pixel buffer from an image element.
This function is useful when you want to rasterize an image to ASCII art.

**`See`**

 - [`rasterize`](classes/Asciify.md#rasterize)
 - [`readFromThreeJS`](modules.md#readfromthreejs)
 - [`readFromCanvas`](modules.md#readfromcanvas)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `image` | `HTMLImageElement` | The image to read pixels from. |
| `canvas` | [`CanvasLike`](modules.md#canvaslike) | A canvas to use for reading the image. You should provide this parameter if you'd like to cache the canvas. |
| `ctx` | [`Canvas2dContextLike`](modules.md#canvas2dcontextlike) | The 2D context to read from. You should provide this parameter if you'd like to cache the context, or provide a context optimized for your content. |

#### Returns

`Uint8ClampedArray`

#### Defined in

[mod.mts:456](https://github.com/sister-software/asciify/blob/5168fb7/mod.mts#L456)

___

### readFromThreeJS

▸ **readFromThreeJS**(`renderer`, `ctx?`): `Uint8ClampedArray`

Read the pixel buffer from a ThreeJS WebGLRenderer.
This function is useful when you want to render a ThreeJS scene to ASCII art.

**`See`**

[`rasterize`](classes/Asciify.md#rasterize)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `renderer` | `WebGLRenderer` | The Three.js renderer to read from. |
| `ctx` | `WebGLRenderingContext` \| `WebGL2RenderingContext` | The WebGL context to read from. Defaults to the context of the renderer. You should provide this if you'd like to cache the context once and reuse it. |

#### Returns

`Uint8ClampedArray`

A Uint8ClampedArray containing the RGBA pixel buffer

#### Defined in

[mod.mts:405](https://github.com/sister-software/asciify/blob/5168fb7/mod.mts#L405)

___

### readFromVideo

▸ **readFromVideo**(`video`, `canvas?`): `Uint8ClampedArray`

Reads the pixel buffer from a video element.
This function is useful when you want to rasterize a video to ASCII art.

**`See`**

 - [`rasterize`](classes/Asciify.md#rasterize)
 - [`readFromThreeJS`](modules.md#readfromthreejs)
 - [`readFromCanvas`](modules.md#readfromcanvas)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `video` | `HTMLVideoElement` | The video to read pixels from. **`See`** - [MDN on HTMLVideoElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement) - [MDN on HTMLMediaElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement) - [MDN on captureStream](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/captureStream) - [MDN on captureStream](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/captureStream) |
| `canvas` | [`CanvasLike`](modules.md#canvaslike) | A canvas to use for reading the video. You should provide this parameter if you'd like to cache the canvas. |

#### Returns

`Uint8ClampedArray`

A Uint8ClampedArray containing the RGBA pixel buffer

#### Defined in

[mod.mts:491](https://github.com/sister-software/asciify/blob/5168fb7/mod.mts#L491)

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

[mod.mts:530](https://github.com/sister-software/asciify/blob/5168fb7/mod.mts#L530)

## Character Set Variables

### DEFAULT\_BW\_CHAR\_LIST

• `Const` **DEFAULT\_BW\_CHAR\_LIST**: `string`[]

A default character set to use for the ASCII art.
Optimized for black and white output.

#### Defined in

[mod.mts:23](https://github.com/sister-software/asciify/blob/5168fb7/mod.mts#L23)

___

### DEFAULT\_CHAR\_SET

• `Const` **DEFAULT\_CHAR\_SET**: `string`[]

A default character set to use for the ASCII art.
More spaces will result in a more contrast ASCII art.
This looks good with both black and white and color output.

**`See`**

 - [`DEFAULT_BW_CHAR_LIST`](modules.md#default_bw_char_list)
 - [`DEFAULT_COLOR_CHAR_LIST`](modules.md#default_color_char_list)

#### Defined in

[mod.mts:16](https://github.com/sister-software/asciify/blob/5168fb7/mod.mts#L16)

___

### DEFAULT\_COLOR\_CHAR\_LIST

• `Const` **DEFAULT\_COLOR\_CHAR\_LIST**: `string`[]

A default character set to use for the ASCII art.
Optimized for richer color output.

#### Defined in

[mod.mts:30](https://github.com/sister-software/asciify/blob/5168fb7/mod.mts#L30)

## Type Aliases

### ASCIIMode

Ƭ **ASCIIMode**: ``"bw"`` \| ``"color"``

The fill style mode used to paint the canvas.

#### Defined in

[mod.mts:53](https://github.com/sister-software/asciify/blob/5168fb7/mod.mts#L53)

___

### Canvas2dContextLike

Ƭ **Canvas2dContextLike**: `OffscreenCanvasRenderingContext2D` \| `CanvasRenderingContext2D`

Either a canvas 2D context or an offscreen canvas 2D context.
Note that the offscreen canvas support varies between browsers.
Safari tends to produce slight visual artifacts when using offscreen canvases.

**`See`**

[MDN on Offscreen Canvas 2D Context](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvasRenderingContext2D)

#### Defined in

[mod.mts:48](https://github.com/sister-software/asciify/blob/5168fb7/mod.mts#L48)

___

### CanvasLike

Ƭ **CanvasLike**: `OffscreenCanvas` \| `HTMLCanvasElement`

Either a canvas or an offscreen canvas.
Note that the offscreen canvas support varies between browsers.
Safari tends to produce slight visual artifacts when using offscreen canvases.

**`See`**

[MDN on Offscreen Canvas](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas)

#### Defined in

[mod.mts:39](https://github.com/sister-software/asciify/blob/5168fb7/mod.mts#L39)
