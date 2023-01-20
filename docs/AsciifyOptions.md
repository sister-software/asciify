# Interface: AsciifyOptions

## Table of contents

### Properties

- [backgroundColor](../wiki/AsciifyOptions#backgroundcolor)
- [block](../wiki/AsciifyOptions#block)
- [characterSet](../wiki/AsciifyOptions#characterset)
- [context](../wiki/AsciifyOptions#context)
- [fontFamily](../wiki/AsciifyOptions#fontfamily)
- [fontSize](../wiki/AsciifyOptions#fontsize)
- [lineHeight](../wiki/AsciifyOptions#lineheight)
- [mode](../wiki/AsciifyOptions#mode)

## Properties

### backgroundColor

• **backgroundColor**: `string`

The background color of the canvas.

#### Defined in

[mod.mts:112](https://github.com/sister-software/asciify/blob/6529c8e/mod.mts#L112)

___

### block

• **block**: `boolean`

Whether to use block characters for the ASCII art.
Overrides the character set.

**`Default`**

false

#### Defined in

[mod.mts:107](https://github.com/sister-software/asciify/blob/6529c8e/mod.mts#L107)

___

### characterSet

• **characterSet**: `string`[]

The available characters to use for the ASCII art.
Characters should be in order of "brightness",
with a space being the least bright and the last character being the most bright.

#### Defined in

[mod.mts:66](https://github.com/sister-software/asciify/blob/6529c8e/mod.mts#L66)

___

### context

• `Optional` **context**: `CanvasRenderingContext2D`

The canvas context to use for the ASCII art.
This is an optional parameter, and if not provided, a new context will be created.

#### Defined in

[mod.mts:118](https://github.com/sister-software/asciify/blob/6529c8e/mod.mts#L118)

___

### fontFamily

• **fontFamily**: `string`

The font family to use for the ASCII art.

**`Default`**

'monospace'

#### Defined in

[mod.mts:72](https://github.com/sister-software/asciify/blob/6529c8e/mod.mts#L72)

___

### fontSize

• **fontSize**: `number`

The font size to use for the ASCII art.

The larger the font size, the fewer characters will fit on the screen.
Make sure to use a known font size, otherwise Safari will choose an approximate size.

**`Default`**

10

#### Defined in

[mod.mts:81](https://github.com/sister-software/asciify/blob/6529c8e/mod.mts#L81)

___

### lineHeight

• **lineHeight**: `number`

The line height to use for the ASCII art. This should be a multiple of the font size.

**`Default`**

1.5

#### Defined in

[mod.mts:87](https://github.com/sister-software/asciify/blob/6529c8e/mod.mts#L87)

___

### mode

• **mode**: [`ASCIIMode`](../wiki/Home#asciimode)

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

[mod.mts:100](https://github.com/sister-software/asciify/blob/6529c8e/mod.mts#L100)
