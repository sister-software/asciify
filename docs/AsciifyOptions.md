# Interface: AsciifyOptions

## Table of contents

### Properties

- [backgroundColor](../wiki/AsciifyOptions#backgroundcolor)
- [block](../wiki/AsciifyOptions#block)
- [characterSet](../wiki/AsciifyOptions#characterset)
- [fontFamily](../wiki/AsciifyOptions#fontfamily)
- [fontSize](../wiki/AsciifyOptions#fontsize)
- [lineHeight](../wiki/AsciifyOptions#lineheight)
- [mode](../wiki/AsciifyOptions#mode)
- [pixelRatio](../wiki/AsciifyOptions#pixelratio)
- [scratchCanvas](../wiki/AsciifyOptions#scratchcanvas)

## Properties

### backgroundColor

• **backgroundColor**: `string`

The background color of the canvas.
This can be any valid CSS color.

**`Default`**

black

#### Defined in

[options.mts:100](https://github.com/sister-software/asciify/blob/836ead9/options.mts#L100)

___

### block

• **block**: `boolean`

Whether to use block characters for the ASCII art.
Overrides the character set.

**`Default`**

false

#### Defined in

[options.mts:92](https://github.com/sister-software/asciify/blob/836ead9/options.mts#L92)

___

### characterSet

• **characterSet**: `string`[]

The available characters to use for the ASCII art.
Characters should be in order of "brightness",
with a space being the least bright and the last character being the most bright.

#### Defined in

[options.mts:50](https://github.com/sister-software/asciify/blob/836ead9/options.mts#L50)

___

### fontFamily

• **fontFamily**: `string`

The font family to use for the ASCII art.

**`Default`**

'monospace'

#### Defined in

[options.mts:56](https://github.com/sister-software/asciify/blob/836ead9/options.mts#L56)

___

### fontSize

• **fontSize**: `number`

The font size to use for the ASCII art.

The larger the font size, the fewer characters will fit on the screen.
Make sure to use a known font size, otherwise Safari will choose an approximate size.

**`Default`**

10

#### Defined in

[options.mts:65](https://github.com/sister-software/asciify/blob/836ead9/options.mts#L65)

___

### lineHeight

• **lineHeight**: `number`

The line height to use for the ASCII art. This should be a multiple of the font size.

**`Default`**

1.5

#### Defined in

[options.mts:71](https://github.com/sister-software/asciify/blob/836ead9/options.mts#L71)

___

### mode

• **mode**: [`ASCIIMode`](../wiki/Home#asciimode)

The mode to use for the ASCII art.

Can be one of the following:

- `'color'` Color
- `'grayscale'` Black and white
- `'block'` Color block characters

**`Default`**

'color'

#### Defined in

[options.mts:84](https://github.com/sister-software/asciify/blob/836ead9/options.mts#L84)

___

### pixelRatio

• **pixelRatio**: `number`

The device pixel ratio to use for the ASCII art.

**`Default`**

window.devicePixelRatio Browser

**`Default`**

1 Node.js and Workers

#### Defined in

[options.mts:107](https://github.com/sister-software/asciify/blob/836ead9/options.mts#L107)

___

### scratchCanvas

• `Optional` **scratchCanvas**: [`CanvasLike`](../wiki/Home#canvaslike) \| [`Canvas2dContextLike`](../wiki/Home#canvas2dcontextlike)

A cached canvas to use while performing operations.
This is an advanced option optional parameter.
Asciify will cache a canvas internally if not provided.

#### Defined in

[options.mts:114](https://github.com/sister-software/asciify/blob/836ead9/options.mts#L114)
