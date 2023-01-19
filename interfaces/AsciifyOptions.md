[@sister.software/asciify](../Home.md) / [Exports](../modules.md) / AsciifyOptions

# Interface: AsciifyOptions

## Table of contents

### Properties

- [backgroundColor](AsciifyOptions.md#backgroundcolor)
- [block](AsciifyOptions.md#block)
- [characterSet](AsciifyOptions.md#characterset)
- [context](AsciifyOptions.md#context)
- [fontFamily](AsciifyOptions.md#fontfamily)
- [fontSize](AsciifyOptions.md#fontsize)
- [lineHeight](AsciifyOptions.md#lineheight)
- [mode](AsciifyOptions.md#mode)

## Properties

### backgroundColor

• **backgroundColor**: `string`

The background color of the canvas.

#### Defined in

[mod.mts:107](https://github.com/sister-software/asciify/blob/5168fb7/mod.mts#L107)

___

### block

• **block**: `boolean`

Whether to use block characters for the ASCII art.
Overrides the character set.

**`Default`**

false

#### Defined in

[mod.mts:102](https://github.com/sister-software/asciify/blob/5168fb7/mod.mts#L102)

___

### characterSet

• **characterSet**: `string`[]

The available characters to use for the ASCII art.
Characters should be in order of "brightness",
with a space being the least bright and the last character being the most bright.

#### Defined in

[mod.mts:61](https://github.com/sister-software/asciify/blob/5168fb7/mod.mts#L61)

___

### context

• `Optional` **context**: `CanvasRenderingContext2D`

The canvas context to use for the ASCII art.
This is an optional parameter, and if not provided, a new context will be created.

#### Defined in

[mod.mts:113](https://github.com/sister-software/asciify/blob/5168fb7/mod.mts#L113)

___

### fontFamily

• **fontFamily**: `string`

The font family to use for the ASCII art.

**`Default`**

'monospace'

#### Defined in

[mod.mts:67](https://github.com/sister-software/asciify/blob/5168fb7/mod.mts#L67)

___

### fontSize

• **fontSize**: `number`

The font size to use for the ASCII art.

The larger the font size, the fewer characters will fit on the screen.
Make sure to use a known font size, otherwise Safari will choose an approximate size.

**`Default`**

10

#### Defined in

[mod.mts:76](https://github.com/sister-software/asciify/blob/5168fb7/mod.mts#L76)

___

### lineHeight

• **lineHeight**: `number`

The line height to use for the ASCII art. This should be a multiple of the font size.

**`Default`**

1.5

#### Defined in

[mod.mts:82](https://github.com/sister-software/asciify/blob/5168fb7/mod.mts#L82)

___

### mode

• **mode**: [`ASCIIMode`](../modules.md#asciimode)

The mode to use for the ASCII art.

**`Default`**

'bw'

**`Remarks`**

Can be one of the following:

- `'bw'` Black and white
- `'color'` Color

**`Default`**

'color'

#### Defined in

[mod.mts:95](https://github.com/sister-software/asciify/blob/5168fb7/mod.mts#L95)
