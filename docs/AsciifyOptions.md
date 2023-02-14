# Interface: AsciifyOptions

The options used to configure the ASCII art.

## Table of contents

### Properties

- [backgroundColor](../wiki/AsciifyOptions#backgroundcolor)
- [characterSet](../wiki/AsciifyOptions#characterset)
- [characterSpacingRatio](../wiki/AsciifyOptions#characterspacingratio)
- [colorize](../wiki/AsciifyOptions#colorize)
- [contrastRatio](../wiki/AsciifyOptions#contrastratio)
- [flipY](../wiki/AsciifyOptions#flipy)
- [fontFamily](../wiki/AsciifyOptions#fontfamily)
- [fontSize](../wiki/AsciifyOptions#fontsize)
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

'#000000'

#### Defined in

[options/common.mts:77](https://github.com/sister-software/asciify/blob/f11c4e8/options/common.mts#L77)

___

### characterSet

• **characterSet**: `string` \| `string`[]

The available characters to use for the ASCII art.
Characters should be in order of "brightness",
with the first character being the least bright and the last being the most bright.

**`Default`**

**`See`**

 - OptionPreset
 - [`contrastRatio`](../wiki/AsciifyOptions#contrastratio)

#### Defined in

[options/common.mts:30](https://github.com/sister-software/asciify/blob/f11c4e8/options/common.mts#L30)

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

[options/common.mts:59](https://github.com/sister-software/asciify/blob/f11c4e8/options/common.mts#L59)

___

### colorize

• **colorize**: `boolean`

Whether to use color in the ASCII art.

**`Default`**

true

#### Defined in

[options/common.mts:66](https://github.com/sister-software/asciify/blob/f11c4e8/options/common.mts#L66)

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

[options/common.mts:94](https://github.com/sister-software/asciify/blob/f11c4e8/options/common.mts#L94)

___

### flipY

• **flipY**: `boolean`

Whether to flip the canvas vertically for Three.js

**`Default`**

true

#### Defined in

[options/common.mts:107](https://github.com/sister-software/asciify/blob/f11c4e8/options/common.mts#L107)

___

### fontFamily

• **fontFamily**: `string`

The font family to use for the ASCII art.

**`Default`**

'monospace'

#### Defined in

[options/common.mts:36](https://github.com/sister-software/asciify/blob/f11c4e8/options/common.mts#L36)

___

### fontSize

• **fontSize**: `number`

The font size to use for the ASCII art.

The larger the font size, the fewer characters will fit on the screen.
Make sure to use a known font size, otherwise Safari will choose an approximate size.

**`Default`**

10

#### Defined in

[options/common.mts:45](https://github.com/sister-software/asciify/blob/f11c4e8/options/common.mts#L45)

___

### pixelRatio

• **pixelRatio**: `number`

The device pixel ratio to use for the ASCII art.

**`Default`**

`devicePixelRatio` Browser

**`Default`**

1 Node.js and Workers

#### Defined in

[options/common.mts:84](https://github.com/sister-software/asciify/blob/f11c4e8/options/common.mts#L84)

___

### scratchCanvas

• **scratchCanvas**: [`CanvasLike`](../wiki/Home#canvaslike) \| [`Canvas2dContextLike`](../wiki/Home#canvas2dcontextlike)

A cached canvas to use while performing operations.
Asciify will automatically cache a canvas internally if not provided.

#### Defined in

[options/common.mts:100](https://github.com/sister-software/asciify/blob/f11c4e8/options/common.mts#L100)
