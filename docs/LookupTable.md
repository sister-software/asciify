# Class: LookupTable

A precalculated lookup table to help us traverse the pixel buffer.
```ts
[red1, green1, blue1, alpha1, redN, greenN, blueN, alphaN...]
```

**`Remarks`**

By precalculating a frequent traversal through a pixel buffer,
we can avoid expensive and repetitive calculations while during rasterization.

The pixel index contains groups of four values that represent the RGBA values of a pixel:

- Red channel index
- Green channel index
- Blue channel index
- Alpha channel index

The length of this array is equal to the area of the row and column counts.

## Table of contents

### Constructors

- [constructor](../wiki/LookupTable#constructor)

### Properties

- [columnCount](../wiki/LookupTable#columncount)
- [coords](../wiki/LookupTable#coords)
- [coordsFlipped](../wiki/LookupTable#coordsflipped)
- [pixelIndex](../wiki/LookupTable#pixelindex)
- [pixelIndexFlippedY](../wiki/LookupTable#pixelindexflippedy)
- [rowCount](../wiki/LookupTable#rowcount)

### Accessors

- [length](../wiki/LookupTable#length)

## Constructors

### constructor

• **new LookupTable**(`rowCount`, `columnCount`, `characterHeight`, `pixelRatio`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `rowCount` | `number` |
| `columnCount` | `number` |
| `characterHeight` | `number` |
| `pixelRatio` | `number` |

#### Defined in

[utils.mts:255](https://github.com/sister-software/asciify/blob/9750ae3/utils.mts#L255)

## Properties

### columnCount

• **columnCount**: `number`

#### Defined in

[utils.mts:255](https://github.com/sister-software/asciify/blob/9750ae3/utils.mts#L255)

___

### coords

• `Readonly` **coords**: [`CharacterCoords`](../wiki/Home#charactercoords)

#### Defined in

[utils.mts:252](https://github.com/sister-software/asciify/blob/9750ae3/utils.mts#L252)

___

### coordsFlipped

• `Readonly` **coordsFlipped**: [`CharacterCoords`](../wiki/Home#charactercoords)

#### Defined in

[utils.mts:253](https://github.com/sister-software/asciify/blob/9750ae3/utils.mts#L253)

___

### pixelIndex

• `Readonly` **pixelIndex**: `Uint32Array`

The lookup table used to map the RGBA buffer to the ASCII art canvas.

#### Defined in

[utils.mts:246](https://github.com/sister-software/asciify/blob/9750ae3/utils.mts#L246)

___

### pixelIndexFlippedY

• `Readonly` **pixelIndexFlippedY**: `Uint32Array`

The lookup table used to map the RGBA buffer to the ASCII art canvas.
This is the same as [`pixelIndex`](../wiki/LookupTable#pixelindex), but with the Y axis flipped for WebGL.

#### Defined in

[utils.mts:251](https://github.com/sister-software/asciify/blob/9750ae3/utils.mts#L251)

___

### rowCount

• **rowCount**: `number`

#### Defined in

[utils.mts:255](https://github.com/sister-software/asciify/blob/9750ae3/utils.mts#L255)

## Accessors

### length

• `get` **length**(): `number`

#### Returns

`number`

#### Defined in

[utils.mts:298](https://github.com/sister-software/asciify/blob/9750ae3/utils.mts#L298)
