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

- [getCharacterFromLuminance](../wiki/Asciify#getcharacterfromluminance)
- [resize](../wiki/Asciify#resize)
- [setOptions](../wiki/Asciify#setoptions)
- [setSize](../wiki/Asciify#setsize)
- [updateCharacterSet](../wiki/Asciify#updatecharacterset)

### Rasterization Methods

- [rasterize](../wiki/Asciify#rasterize)
- [rasterizeImage](../wiki/Asciify#rasterizeimage)
- [rasterizeThree](../wiki/Asciify#rasterizethree)

## Constructors

### constructor

• **new Asciify**(`outputCanvas?`, `options?`)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `outputCanvas` | [`CanvasLike`](../wiki/Home#canvaslike) \| [`Canvas2dContextLike`](../wiki/Home#canvas2dcontextlike) | The canvas where the ASCII art will be rendered to. This can either be a canvas element or a canvas's 2D context. |
| `options` | `Partial`<[`AsciifyOptions`](../wiki/AsciifyOptions)\> | Options to use when rendering the ASCII art. **`See`** [`AsciifyOptions`](../wiki/AsciifyOptions) for more information. |

#### Defined in

[Asciify.mts:389](https://github.com/sister-software/asciify/blob/836ead9/Asciify.mts#L389)

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

[Asciify.mts:51](https://github.com/sister-software/asciify/blob/836ead9/Asciify.mts#L51)

___

### columnCount

• **columnCount**: `number` = `0`

The number of columns in the ASCII art.
This corresponds to the width of the source material.

#### Defined in

[Asciify.mts:74](https://github.com/sister-software/asciify/blob/836ead9/Asciify.mts#L74)

___

### ctx

• **ctx**: [`Canvas2dContextLike`](../wiki/Home#canvas2dcontextlike)

The canvas context where ASCII art is rasterized to.

#### Defined in

[Asciify.mts:68](https://github.com/sister-software/asciify/blob/836ead9/Asciify.mts#L68)

___

### options

• **options**: [`AsciifyOptions`](../wiki/AsciifyOptions)

The options used to initialize the Asciify instance.

**`See`**

 - [`setOptions`](../wiki/Asciify#setoptions)
 - [`AsciifyOptions`](../wiki/AsciifyOptions)

#### Defined in

[Asciify.mts:94](https://github.com/sister-software/asciify/blob/836ead9/Asciify.mts#L94)

___

### rowCount

• **rowCount**: `number` = `0`

The number of rows in the ASCII art.
This corresponds to the height of the source material.

**`See`**

[`setSize`](../wiki/Asciify#setsize)

#### Defined in

[Asciify.mts:80](https://github.com/sister-software/asciify/blob/836ead9/Asciify.mts#L80)

## Accessors

### domElement

• `get` **domElement**(): `HTMLCanvasElement`

A type-friendly getter for the canvas element.

**`Throws`**

`Error` if Asciify is used with an `OffscreenCanvas`

#### Returns

`HTMLCanvasElement`

#### Defined in

[Asciify.mts:57](https://github.com/sister-software/asciify/blob/836ead9/Asciify.mts#L57)

## Other Methods

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

[Asciify.mts:379](https://github.com/sister-software/asciify/blob/836ead9/Asciify.mts#L379)

___

### resize

▸ **resize**(`imageSource?`): `void`

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
| `imageSource` | [`CanvasLike`](../wiki/Home#canvaslike) \| `WebGLRenderer` |

#### Returns

`void`

#### Defined in

[Asciify.mts:175](https://github.com/sister-software/asciify/blob/836ead9/Asciify.mts#L175)

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

[Asciify.mts:188](https://github.com/sister-software/asciify/blob/836ead9/Asciify.mts#L188)

___

### setSize

▸ **setSize**(`nextWidth`, `nextHeight`, `imageSource?`): `void`

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
| `nextWidth` | `number` | The width of the ASCII art canvas. |
| `nextHeight` | `number` | The height of the ASCII art canvas. |
| `imageSource` | [`CanvasLike`](../wiki/Home#canvaslike) \| `WebGLRenderer` | An optional source canvas to pass to [`resize`](../wiki/Asciify#resize) |

#### Returns

`void`

#### Defined in

[Asciify.mts:136](https://github.com/sister-software/asciify/blob/836ead9/Asciify.mts#L136)

___

### updateCharacterSet

▸ **updateCharacterSet**(`characterSet`): `void`

Updates the character set used for the ASCII art.
This can be used to change the character set on the fly during an animation.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `characterSet` | `string`[] | The next character set to use for the ASCII art. |

#### Returns

`void`

#### Defined in

[Asciify.mts:237](https://github.com/sister-software/asciify/blob/836ead9/Asciify.mts#L237)

___

## Rasterization Methods

### rasterize

▸ **rasterize**(`rgbaBuffer`, `bufferIsUpsideDown?`, `persistCanvas?`): `void`

Renders given RGBA buffer to the ASCII art canvas.

This method may be used directly when performance is critical.

**`See`**

 - [`rasterizeThree`](../wiki/Asciify#rasterizethree)
 - [`rasterizeImage`](../wiki/Asciify#rasterizeimage)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rgbaBuffer` | `Uint8ClampedArray` | A buffer containing the RGBA values of the image. |
| `bufferIsUpsideDown?` | `boolean` | Useful when rendering a Three.js scene. |
| `persistCanvas?` | `boolean` | Whether to persist the canvas. Useful when composing multiple images. |

#### Returns

`void`

#### Defined in

[Asciify.mts:255](https://github.com/sister-software/asciify/blob/836ead9/Asciify.mts#L255)

___

### rasterizeImage

▸ **rasterizeImage**(`imageSource`): `Promise`<`void`\>

Rasterizes the given image to the ASCII art canvas.

**`See`**

 - [`rasterize`](../wiki/Asciify#rasterize)
 - [`readFromImage`](../wiki/Home#readfromimage)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `imageSource` | `ImageBitmapSource` | The image to read pixels from. This will be resized to match the next given `canvas` argument. |

#### Returns

`Promise`<`void`\>

#### Defined in

[Asciify.mts:343](https://github.com/sister-software/asciify/blob/836ead9/Asciify.mts#L343)

___

### rasterizeThree

▸ **rasterizeThree**(`renderer`, `ctx?`): `void`

Rasterizes the given Three.js renderer to the ASCII art canvas.

**`See`**

 - [`rasterize`](../wiki/Asciify#rasterize)
 - [`readFromImage`](../wiki/Home#readfromimage)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `renderer` | `WebGLRenderer` | The Three.js renderer to read from. |
| `ctx` | `WebGLRenderingContext` \| `WebGL2RenderingContext` | The WebGL context to read from. Defaults to the context of the renderer. You should provide this if you'd like to cache the context once and reuse it. |

#### Returns

`void`

#### Defined in

[Asciify.mts:361](https://github.com/sister-software/asciify/blob/836ead9/Asciify.mts#L361)
