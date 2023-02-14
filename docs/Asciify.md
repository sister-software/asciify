# Class: Asciify

Converts images, videos, and 3D renders into ASCII art.

```ts
const outputCanvas = document.createElement('canvas')
const asciify = new Asciify(canvas)
const sourceCanvas = document.createElement('canvas')

asciify.setSize(window.innerWidth, window.innerHeight, sourceCanvas)
asciify.rasterize(image)
```

**`See`**

[API documentation](https://sister.software/asciify)

## Table of contents

### Constructors

- [constructor](../wiki/Asciify#constructor)

### Properties

- [canvas](../wiki/Asciify#canvas)
- [columnCount](../wiki/Asciify#columncount)
- [ctx](../wiki/Asciify#ctx)
- [options](../wiki/Asciify#options)
- [rowCount](../wiki/Asciify#rowcount)

### Accessors

- [domElement](../wiki/Asciify#domelement)

### Other Methods

- [applySizeTo](../wiki/Asciify#applysizeto)
- [clearCanvas](../wiki/Asciify#clearcanvas)
- [clearFrameBuffers](../wiki/Asciify#clearframebuffers)
- [getCharacterFromLuminance](../wiki/Asciify#getcharacterfromluminance)
- [setOptions](../wiki/Asciify#setoptions)
- [setSize](../wiki/Asciify#setsize)

### Rasterization Methods

- [rasterize](../wiki/Asciify#rasterize)
- [rasterizeImage](../wiki/Asciify#rasterizeimage)
- [rasterizeWebGLRenderer](../wiki/Asciify#rasterizewebglrenderer)

## Constructors

### constructor

• **new Asciify**(`outputCanvas?`, `options?`)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `outputCanvas` | [`CanvasLike`](../wiki/Home#canvaslike) \| [`Canvas2dContextLike`](../wiki/Home#canvas2dcontextlike) | The canvas where the ASCII art will be rendered to. This can either be a canvas element or a canvas's 2D context. **`Optional`** |
| `options` | `Partial`<[`AsciifyOptions`](../wiki/AsciifyOptions)\> | Options to use when rendering the ASCII art. **`Optional`** **`See`** [`AsciifyOptions`](../wiki/AsciifyOptions) for more information. |

#### Defined in

[Asciify.mts:144](https://github.com/sister-software/asciify/blob/f11c4e8/Asciify.mts#L144)

## Properties

### canvas

• **canvas**: [`CanvasLike`](../wiki/Home#canvaslike)

The canvas where ASCII art is rasterized to.

**`Remarks`**

If rendering to the screen, make sure to mount the canvas to the DOM.
You can use this canvas to render the ASCII art to the screen.

**`See`**

[`setSize`](../wiki/Asciify#setsize).

#### Defined in

[Asciify.mts:56](https://github.com/sister-software/asciify/blob/f11c4e8/Asciify.mts#L56)

___

### columnCount

• **columnCount**: `number` = `0`

The number of columns in the ASCII art.
This corresponds to the width of the source material.

#### Defined in

[Asciify.mts:79](https://github.com/sister-software/asciify/blob/f11c4e8/Asciify.mts#L79)

___

### ctx

• **ctx**: [`Canvas2dContextLike`](../wiki/Home#canvas2dcontextlike)

The canvas context where ASCII art is rasterized to.

#### Defined in

[Asciify.mts:73](https://github.com/sister-software/asciify/blob/f11c4e8/Asciify.mts#L73)

___

### options

• **options**: [`AsciifyOptions`](../wiki/AsciifyOptions)

The options used to initialize the Asciify instance.

**`See`**

 - [`setOptions`](../wiki/Asciify#setoptions)
 - [`AsciifyOptions`](../wiki/AsciifyOptions)

#### Defined in

[Asciify.mts:97](https://github.com/sister-software/asciify/blob/f11c4e8/Asciify.mts#L97)

___

### rowCount

• **rowCount**: `number` = `0`

The number of rows in the ASCII art.
This corresponds to the height of the source material.

**`See`**

[`setSize`](../wiki/Asciify#setsize)

#### Defined in

[Asciify.mts:85](https://github.com/sister-software/asciify/blob/f11c4e8/Asciify.mts#L85)

## Accessors

### domElement

• `get` **domElement**(): `HTMLCanvasElement`

A type-friendly getter for the canvas element.

**`Throws`**

`Error` if Asciify is used with an `OffscreenCanvas`

#### Returns

`HTMLCanvasElement`

#### Defined in

[Asciify.mts:62](https://github.com/sister-software/asciify/blob/f11c4e8/Asciify.mts#L62)

## Other Methods

### applySizeTo

▸ **applySizeTo**(`imageSource`): `void`

Resizes a given image source to fit the ASCII art canvas.

Note that this method does not resize the output canvas.

This should be called whenever the size of the ASCII art canvas changes,
when the source canvas is resized, or when the asciify instance options are changed.

**`See`**

 - [`setSize`](../wiki/Asciify#setsize)
 - [`setOptions`](../wiki/Asciify#setoptions)

#### Parameters

| Name | Type |
| :------ | :------ |
| `imageSource` | [`CanvasLike`](../wiki/Home#canvaslike) \| `WebGLRenderer` \| `WebGLRenderTarget` |

#### Returns

`void`

#### Defined in

[Asciify.mts:255](https://github.com/sister-software/asciify/blob/f11c4e8/Asciify.mts#L255)

___

### clearCanvas

▸ **clearCanvas**(): `void`

Clears the canvas.
Asciify will automatically handle this for you in most cases.

#### Returns

`void`

#### Defined in

[Asciify.mts:455](https://github.com/sister-software/asciify/blob/f11c4e8/Asciify.mts#L455)

___

### clearFrameBuffers

▸ **clearFrameBuffers**(): `void`

Clears the frame buffers.
Asciify will automatically handle this for you in most cases.

#### Returns

`void`

#### Defined in

[Asciify.mts:446](https://github.com/sister-software/asciify/blob/f11c4e8/Asciify.mts#L446)

___

### getCharacterFromLuminance

▸ **getCharacterFromLuminance**(`luminance`): `string`

Returns the character that best matches the given brightness.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `luminance` | `number` | A number between 0 and 1. |

#### Returns

`string`

#### Defined in

[Asciify.mts:181](https://github.com/sister-software/asciify/blob/f11c4e8/Asciify.mts#L181)

___

### setOptions

▸ **setOptions**(`nextOptions?`): `void`

Sets new options for the ASCII art.
Useful for changing the asciify instance on the fly.

#### Parameters

| Name | Type |
| :------ | :------ |
| `nextOptions` | `Partial`<[`AsciifyOptions`](../wiki/AsciifyOptions)\> |

#### Returns

`void`

#### Defined in

[Asciify.mts:268](https://github.com/sister-software/asciify/blob/f11c4e8/Asciify.mts#L268)

___

### setSize

▸ **setSize**(`nextWidth?`, `nextHeight?`, `imageSource?`): `void`

Sets the size of the ASCII art canvas, updating the number of columns and rows.

You should call this method whenever an instance of asciify changes dimensions.

```ts
asciify.setSize(width, height, renderer)
```

Alternatively, you can use use the `columnCount` and `rowCount`
properties to set separately the size of the source canvas.

```ts
asciify.setSize(width, height)
renderer.setSize(asciify.columnCount, asciify.rowCount)
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `nextWidth?` | `number` | The width of the ASCII art canvas. |
| `nextHeight?` | `number` | The height of the ASCII art canvas. |
| `imageSource?` | [`CanvasLike`](../wiki/Home#canvaslike) \| `WebGLRenderer` \| `WebGLRenderTarget` | An optional source canvas to pass to [`applySizeTo`](../wiki/Asciify#applysizeto) |

#### Returns

`void`

#### Defined in

[Asciify.mts:207](https://github.com/sister-software/asciify/blob/f11c4e8/Asciify.mts#L207)

___

## Rasterization Methods

### rasterize

▸ **rasterize**(`nextFrameBuffer`, `pixelIndex?`, `coords?`): `void`

Renders given RGBA buffer to the ASCII art canvas.

This method may be used directly when performance is critical.

**`See`**

 - [`rasterizeWebGLRenderer`](../wiki/Asciify#rasterizewebglrenderer)
 - [`rasterizeImage`](../wiki/Asciify#rasterizeimage)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `nextFrameBuffer` | [`FrameBuffer`](../wiki/FrameBuffer) | A buffer containing the RGBA values of the image. |
| `pixelIndex` | `Uint32Array` | Lookup table to use for the next frame. **`Optional`** |
| `coords` | [`CharacterCoords`](../wiki/Home#charactercoords) | Character coord map to use for the next frame. **`Optional`** |

#### Returns

`void`

#### Defined in

[Asciify.mts:383](https://github.com/sister-software/asciify/blob/f11c4e8/Asciify.mts#L383)

___

### rasterizeImage

▸ **rasterizeImage**(`imageSource`): `Promise`<[`FrameBuffer`](../wiki/FrameBuffer)\>

Rasterizes the given image to the ASCII art canvas.

**`See`**

 - [`rasterize`](../wiki/Asciify#rasterize)
 - [`readFromImage`](../wiki/Home#readfromimage)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `imageSource` | `CanvasImageSource` | The image to read pixels from. This will be resized to match the next given `canvas` argument. |

#### Returns

`Promise`<[`FrameBuffer`](../wiki/FrameBuffer)\>

#### Defined in

[Asciify.mts:304](https://github.com/sister-software/asciify/blob/f11c4e8/Asciify.mts#L304)

___

### rasterizeWebGLRenderer

▸ **rasterizeWebGLRenderer**(`renderer`, `ctx?`, `clearCanvas?`, `resetFrameBuffers?`): `void`

Rasterizes the given Three.js renderer to the ASCII art canvas.

**`See`**

[`rasterize`](../wiki/Asciify#rasterize)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `renderer` | `WebGLRenderer` | The Three.js renderer to read pixel data from. |
| `ctx` | `WebGLRenderingContext` \| `WebGL2RenderingContext` | The WebGL context to read from. Defaults to the context of the renderer. You should provide this if you'd like to cache the context once and reuse it. **`Optional`** |
| `clearCanvas?` | `boolean` | Whether the canvas should be cleared before rasterizing the next frame. This option is useful when composing multiple render sources onto the same canvas. **`Optional`** |
| `resetFrameBuffers?` | `boolean` | Whether the frame buffer should be reset. This option is useful if you're handling frame buffer management yourself. **`Optional`** |

#### Returns

`void`

#### Defined in

[Asciify.mts:326](https://github.com/sister-software/asciify/blob/f11c4e8/Asciify.mts#L326)
