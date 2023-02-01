# Interface: AsciifyOptions

The options used to configure the ASCII art.

## Table of contents

### Properties

- [backgroundColor](../wiki/AsciifyOptions#backgroundcolor)
- [characterSet](../wiki/AsciifyOptions#characterset)
- [characterSpacingRatio](../wiki/AsciifyOptions#characterspacingratio)
- [contrastRatio](../wiki/AsciifyOptions#contrastratio)
- [flipY](../wiki/AsciifyOptions#flipy)
- [fontFamily](../wiki/AsciifyOptions#fontfamily)
- [fontSize](../wiki/AsciifyOptions#fontsize)
- [mode](../wiki/AsciifyOptions#mode)
- [pixelRatio](../wiki/AsciifyOptions#pixelratio)
- [scratchCanvas](../wiki/AsciifyOptions#scratchcanvas)

## Properties

### backgroundColor

• **backgroundColor**: `string`

The background color of the character set.

This may be set to any valid CSS color.
Note that this will only apply to the background of the ASCII characters.
The source image pixel data ultimately determines which character is used.

**`Default`**

black

#### Defined in

[configuration.mts:95](https://github.com/sister-software/asciify/blob/9750ae3/configuration.mts#L95)

___

### characterSet

• **characterSet**: `string`[]

The available characters to use for the ASCII art.
Characters should be in order of "brightness",
with the first character being the least bright and the last being the most bright.

**`Default`**

DEFAULT_CHAR_SET

**`See`**

[`DEFAULT_CHAR_SET`](../wiki/Home#default_char_set)
#see [`contrastRatio`](../wiki/AsciifyOptions#contrastratio)

#### Defined in

[configuration.mts:42](https://github.com/sister-software/asciify/blob/9750ae3/configuration.mts#L42)

___

### characterSpacingRatio

• **characterSpacingRatio**: `number`

The spacing ratio to use for the characters.

This should be a multiple of the font size, usually between 0.8 and 2.
Larger ratios will result in more spacing between lines and a faster render time.
Smaller ratios will result in more characters fitting on the screen and a slower render time.

A ratio less than 1 will result in the characters being squished closer together,
and when paired with small font sizes, will result in the characters being illegible.

**`Default`**

1

#### Defined in

[configuration.mts:71](https://github.com/sister-software/asciify/blob/9750ae3/configuration.mts#L71)

___

### contrastRatio

• **contrastRatio**: `number`

The contrast ratio use to pad the character set across the luminance range.
This is a value between 0 and 255, with a usual range between 0 and 5.
A lower value will result in the character set being used more often and slower rendering.
A higher value will result in empty space being used more often and faster rendering.

**`Default`**

3

#### Defined in

[configuration.mts:112](https://github.com/sister-software/asciify/blob/9750ae3/configuration.mts#L112)

___

### flipY

• **flipY**: `boolean`

Whether to flip the canvas vertically for Three.js

**`Default`**

true

#### Defined in

[configuration.mts:125](https://github.com/sister-software/asciify/blob/9750ae3/configuration.mts#L125)

___

### fontFamily

• **fontFamily**: `string`

The font family to use for the ASCII art.

**`Default`**

'monospace'

#### Defined in

[configuration.mts:48](https://github.com/sister-software/asciify/blob/9750ae3/configuration.mts#L48)

___

### fontSize

• **fontSize**: `number`

The font size to use for the ASCII art.

The larger the font size, the fewer characters will fit on the screen.
Make sure to use a known font size, otherwise Safari will choose an approximate size.

**`Default`**

10

#### Defined in

[configuration.mts:57](https://github.com/sister-software/asciify/blob/9750ae3/configuration.mts#L57)

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

[configuration.mts:84](https://github.com/sister-software/asciify/blob/9750ae3/configuration.mts#L84)

___

### pixelRatio

• **pixelRatio**: `number`

The device pixel ratio to use for the ASCII art.

**`Default`**

`devicePixelRatio` Browser

**`Default`**

1 Node.js and Workers

#### Defined in

[configuration.mts:102](https://github.com/sister-software/asciify/blob/9750ae3/configuration.mts#L102)

___

### scratchCanvas

• **scratchCanvas**: [`CanvasLike`](../wiki/Home#canvaslike) \| [`Canvas2dContextLike`](../wiki/Home#canvas2dcontextlike)

A cached canvas to use while performing operations.
Asciify will automatically cache a canvas internally if not provided.

#### Defined in

[configuration.mts:118](https://github.com/sister-software/asciify/blob/9750ae3/configuration.mts#L118)
