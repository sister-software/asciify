# Class: Asciify

Converts images, videos, and 3D renders into ASCII art.

```ts
const canvas = document.createElement('canvas')
const asciify = new ASCIIRasterizer(canvas)

asciify.setSize(window.innerWidth, window.innerHeight)
asciify.rasterize(image)
```

**`See`**

[API documentation](https://asciify.sister.software)

## Table of contents

### Constructors

- [constructor](../wiki/Asciify#constructor)

### Properties

- [backgroundColor](../wiki/Asciify#backgroundcolor)
- [canvas](../wiki/Asciify#canvas)
- [columnCount](../wiki/Asciify#columncount)
- [ctx](../wiki/Asciify#ctx)
- [fontFamily](../wiki/Asciify#fontfamily)
- [fontSize](../wiki/Asciify#fontsize)
- [rowCount](../wiki/Asciify#rowcount)

### Methods

- [getCharacterFromLuminance](../wiki/Asciify#getcharacterfromluminance)
- [rasterize](../wiki/Asciify#rasterize)
- [setSize](../wiki/Asciify#setsize)
- [updateCharacterSet](../wiki/Asciify#updatecharacterset)

## Constructors

### constructor

• **new Asciify**(`canvas`, `options?`)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `canvas` | [`CanvasLike`](../wiki/Home#canvaslike) | The canvas to render the ASCII art to. |
| `options` | `Partial`<[`AsciifyOptions`](../wiki/AsciifyOptions)\> | Options to use when rendering the ASCII art. **`See`** [`AsciifyOptions`](../wiki/AsciifyOptions) for more information. |

#### Defined in

[mod.mts:341](https://github.com/sister-software/asciify/blob/fbda2ec/mod.mts#L341)

## Properties

### backgroundColor

• **backgroundColor**: `string`

#### Defined in

[mod.mts:180](https://github.com/sister-software/asciify/blob/fbda2ec/mod.mts#L180)

___

### canvas

• **canvas**: [`CanvasLike`](../wiki/Home#canvaslike)

The canvas where ASCII art is rasterized to.

**`Remarks`**

If rendering to the screen, make sure to mount the canvas to the DOM.
You can use this canvas to render the ASCII art to the screen.
If used with a Three.js renderer, you should resize the render after calling [`setSize`](../wiki/Asciify#setsize).

#### Defined in

[mod.mts:155](https://github.com/sister-software/asciify/blob/fbda2ec/mod.mts#L155)

___

### columnCount

• **columnCount**: `number` = `0`

The number of columns in the ASCII art.
This corresponds to the width of the source material.

#### Defined in

[mod.mts:166](https://github.com/sister-software/asciify/blob/fbda2ec/mod.mts#L166)

___

### ctx

• **ctx**: [`Canvas2dContextLike`](../wiki/Home#canvas2dcontextlike)

The canvas context where ASCII art is rasterized to.

#### Defined in

[mod.mts:160](https://github.com/sister-software/asciify/blob/fbda2ec/mod.mts#L160)

___

### fontFamily

• **fontFamily**: `string`

#### Defined in

[mod.mts:182](https://github.com/sister-software/asciify/blob/fbda2ec/mod.mts#L182)

___

### fontSize

• **fontSize**: `number`

#### Defined in

[mod.mts:183](https://github.com/sister-software/asciify/blob/fbda2ec/mod.mts#L183)

___

### rowCount

• **rowCount**: `number` = `0`

The number of rows in the ASCII art.
This corresponds to the height of the source material.

#### Defined in

[mod.mts:171](https://github.com/sister-software/asciify/blob/fbda2ec/mod.mts#L171)

## Methods

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

[mod.mts:331](https://github.com/sister-software/asciify/blob/fbda2ec/mod.mts#L331)

___

### rasterize

▸ **rasterize**(`rgbaBuffer`, `flipY?`, `persistCanvas?`): `void`

Renders an image to the ASCII art canvas.

**`See`**

 - [`readFromThreeJS`](../wiki/Home#readfromthreejs)
 - [`readFromCanvas`](../wiki/Home#readfromcanvas)
 - [`readFromImage`](../wiki/Home#readfromimage)
 - [`readFromVideo`](../wiki/Home#readfromvideo)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rgbaBuffer` | `Uint8ClampedArray` | A buffer containing the RGBA values of the image. |
| `flipY?` | `boolean` | Whether to flip the image vertically. Useful when rendering a Three.js scene. |
| `persistCanvas?` | `boolean` | Whether to persist the canvas. Useful when composing multiple images. |

#### Returns

`void`

#### Defined in

[mod.mts:256](https://github.com/sister-software/asciify/blob/fbda2ec/mod.mts#L256)

___

### setSize

▸ **setSize**(`nextWidth`, `nextHeight`, `devicePixelRatio?`): `void`

Sets the size of the ASCII art canvas, updating the number of columns and rows.

You should call this method whenever the size of the parent canvas changes.
If used with a Three.js renderer, you should resize the render after calling this method.

```ts
asciify.setSize(width, height)
renderer.setSize(asciify.columnCount, asciify.rowCount)
```

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `nextWidth` | `number` | `undefined` |
| `nextHeight` | `number` | `undefined` |
| `devicePixelRatio` | `number` | `window.devicePixelRatio` |

#### Returns

`void`

#### Defined in

[mod.mts:199](https://github.com/sister-software/asciify/blob/fbda2ec/mod.mts#L199)

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

[mod.mts:239](https://github.com/sister-software/asciify/blob/fbda2ec/mod.mts#L239)