# Class: TextureCache

A cache containing the pre-rendered image data of the character set.

**`Remarks`**

The texture cache allows us to avoid re-rendering the character set for each frame.
And since there are a fixed amount of luminance values, we can pre-render the character set
associated with each value.

Additionally, the cache will automatically upgrade the canvas
to a more performant [`ImageBitmap`](https://developer.mozilla.org/en-US/docs/Web/API/ImageBitmap)
if the browser supports it.

## Hierarchy

- `Array`<[`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`\>

  ↳ **`TextureCache`**

## Table of contents

### Constructors

- [constructor](../wiki/TextureCache#constructor)

### Properties

- [initializedBitmaps](../wiki/TextureCache#initializedbitmaps)
- [length](../wiki/TextureCache#length)
- [[species]](../wiki/TextureCache#%5Bspecies%5D)

### Methods

- [[iterator]](../wiki/TextureCache#%5Biterator%5D)
- [[unscopables]](../wiki/TextureCache#%5Bunscopables%5D)
- [at](../wiki/TextureCache#at)
- [concat](../wiki/TextureCache#concat)
- [copyWithin](../wiki/TextureCache#copywithin)
- [entries](../wiki/TextureCache#entries)
- [every](../wiki/TextureCache#every)
- [fill](../wiki/TextureCache#fill)
- [filter](../wiki/TextureCache#filter)
- [find](../wiki/TextureCache#find)
- [findIndex](../wiki/TextureCache#findindex)
- [flat](../wiki/TextureCache#flat)
- [flatMap](../wiki/TextureCache#flatmap)
- [forEach](../wiki/TextureCache#foreach)
- [includes](../wiki/TextureCache#includes)
- [indexOf](../wiki/TextureCache#indexof)
- [join](../wiki/TextureCache#join)
- [keys](../wiki/TextureCache#keys)
- [lastIndexOf](../wiki/TextureCache#lastindexof)
- [map](../wiki/TextureCache#map)
- [pop](../wiki/TextureCache#pop)
- [push](../wiki/TextureCache#push)
- [reduce](../wiki/TextureCache#reduce)
- [reduceRight](../wiki/TextureCache#reduceright)
- [reverse](../wiki/TextureCache#reverse)
- [shift](../wiki/TextureCache#shift)
- [slice](../wiki/TextureCache#slice)
- [some](../wiki/TextureCache#some)
- [sort](../wiki/TextureCache#sort)
- [splice](../wiki/TextureCache#splice)
- [toLocaleString](../wiki/TextureCache#tolocalestring)
- [toString](../wiki/TextureCache#tostring)
- [unshift](../wiki/TextureCache#unshift)
- [values](../wiki/TextureCache#values)
- [from](../wiki/TextureCache#from)
- [isArray](../wiki/TextureCache#isarray)
- [of](../wiki/TextureCache#of)

## Constructors

### constructor

• **new TextureCache**(`luminanceCharacterMap`, `textureMetrics`, `fontFamily`, `debug?`, `bitmapsEnabled?`)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `luminanceCharacterMap` | [`LuminanceCharacterMap`](../wiki/LuminanceCharacterMap) | `undefined` |
| `textureMetrics` | [`TextureMetrics`](../wiki/TextureMetrics) | `undefined` |
| `fontFamily` | `string` | `undefined` |
| `debug` | `boolean` | `false` |
| `bitmapsEnabled` | `boolean` | `supportsCreateImageBitmap` |

#### Overrides

Array&lt;CanvasLike \| ImageBitmap\&gt;.constructor

#### Defined in

[utils/TextureCache.mts:27](https://github.com/sister-software/asciify/blob/86cb63b/utils/TextureCache.mts#L27)

## Properties

### initializedBitmaps

• **initializedBitmaps**: `Promise`<`void`\>

A promise that resolves when all of the bitmaps have been initialized.

#### Defined in

[utils/TextureCache.mts:25](https://github.com/sister-software/asciify/blob/86cb63b/utils/TextureCache.mts#L25)

___

### length

• **length**: `number`

Gets or sets the length of the array. This is a number one higher than the highest index in the array.

#### Inherited from

Array.length

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1304

___

### [species]

▪ `Static` `Readonly` **[species]**: `ArrayConstructor`

#### Inherited from

Array.\_\_@species@1733

#### Defined in

node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:314

## Methods

### [iterator]

▸ **[iterator]**(): `IterableIterator`<[`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`\>

Iterator

#### Returns

`IterableIterator`<[`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`\>

#### Inherited from

Array.\_\_@iterator@243

#### Defined in

node_modules/typescript/lib/lib.es2015.iterable.d.ts:60

___

### [unscopables]

▸ **[unscopables]**(): `Object`

Returns an object whose properties have the value 'true'
when they will be absent when used in a 'with' statement.

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `copyWithin` | `boolean` |
| `entries` | `boolean` |
| `fill` | `boolean` |
| `find` | `boolean` |
| `findIndex` | `boolean` |
| `keys` | `boolean` |
| `values` | `boolean` |

#### Inherited from

Array.\_\_@unscopables@1697

#### Defined in

node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:99

___

### at

▸ **at**(`index`): `undefined` \| [`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`

Returns the item located at the specified index.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `index` | `number` | The zero-based index of the desired code unit. A negative index will count back from the last item. |

#### Returns

`undefined` \| [`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`

#### Inherited from

Array.at

#### Defined in

node_modules/typescript/lib/lib.es2022.array.d.ts:26

___

### concat

▸ **concat**(`...items`): ([`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`)[]

Combines two or more arrays.
This method returns a new array without modifying any existing arrays.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...items` | `ConcatArray`<[`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`\>[] | Additional arrays and/or items to add to the end of the array. |

#### Returns

([`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`)[]

#### Inherited from

Array.concat

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1328

▸ **concat**(`...items`): ([`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`)[]

Combines two or more arrays.
This method returns a new array without modifying any existing arrays.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...items` | ([`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap` \| `ConcatArray`<[`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`\>)[] | Additional arrays and/or items to add to the end of the array. |

#### Returns

([`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`)[]

#### Inherited from

Array.concat

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1334

___

### copyWithin

▸ **copyWithin**(`target`, `start`, `end?`): [`TextureCache`](../wiki/TextureCache)

Returns the this object after copying a section of the array identified by start and end
to the same array starting at position target

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | `number` | If target is negative, it is treated as length+target where length is the length of the array. |
| `start` | `number` | If start is negative, it is treated as length+start. If end is negative, it is treated as length+end. |
| `end?` | `number` | If not specified, length of the this object is used as its default value. |

#### Returns

[`TextureCache`](../wiki/TextureCache)

#### Inherited from

Array.copyWithin

#### Defined in

node_modules/typescript/lib/lib.es2015.core.d.ts:64

___

### entries

▸ **entries**(): `IterableIterator`<[`number`, [`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`]\>

Returns an iterable of key, value pairs for every entry in the array

#### Returns

`IterableIterator`<[`number`, [`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`]\>

#### Inherited from

Array.entries

#### Defined in

node_modules/typescript/lib/lib.es2015.iterable.d.ts:65

___

### every

▸ **every**<`S`\>(`predicate`, `thisArg?`): this is S[]

Determines whether all the members of an array satisfy the specified test.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `S` | extends [`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `predicate` | (`value`: [`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`, `index`: `number`, `array`: ([`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`)[]) => value is S | A function that accepts up to three arguments. The every method calls the predicate function for each element in the array until the predicate returns a value which is coercible to the Boolean value false, or until the end of the array. |
| `thisArg?` | `any` | An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value. |

#### Returns

this is S[]

#### Inherited from

Array.every

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1411

▸ **every**(`predicate`, `thisArg?`): `boolean`

Determines whether all the members of an array satisfy the specified test.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `predicate` | (`value`: [`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`, `index`: `number`, `array`: ([`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`)[]) => `unknown` | A function that accepts up to three arguments. The every method calls the predicate function for each element in the array until the predicate returns a value which is coercible to the Boolean value false, or until the end of the array. |
| `thisArg?` | `any` | An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value. |

#### Returns

`boolean`

#### Inherited from

Array.every

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1420

___

### fill

▸ **fill**(`value`, `start?`, `end?`): [`TextureCache`](../wiki/TextureCache)

Changes all array elements from `start` to `end` index to a static `value` and returns the modified array

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | [`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap` | value to fill array section with |
| `start?` | `number` | index to start filling the array at. If start is negative, it is treated as length+start where length is the length of the array. |
| `end?` | `number` | index to stop filling the array at. If end is negative, it is treated as length+end. |

#### Returns

[`TextureCache`](../wiki/TextureCache)

#### Inherited from

Array.fill

#### Defined in

node_modules/typescript/lib/lib.es2015.core.d.ts:53

___

### filter

▸ **filter**<`S`\>(`predicate`, `thisArg?`): `S`[]

Returns the elements of an array that meet the condition specified in a callback function.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `S` | extends [`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `predicate` | (`value`: [`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`, `index`: `number`, `array`: ([`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`)[]) => value is S | A function that accepts up to three arguments. The filter method calls the predicate function one time for each element in the array. |
| `thisArg?` | `any` | An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value. |

#### Returns

`S`[]

#### Inherited from

Array.filter

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1447

▸ **filter**(`predicate`, `thisArg?`): ([`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`)[]

Returns the elements of an array that meet the condition specified in a callback function.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `predicate` | (`value`: [`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`, `index`: `number`, `array`: ([`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`)[]) => `unknown` | A function that accepts up to three arguments. The filter method calls the predicate function one time for each element in the array. |
| `thisArg?` | `any` | An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value. |

#### Returns

([`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`)[]

#### Inherited from

Array.filter

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1453

___

### find

▸ **find**<`S`\>(`predicate`, `thisArg?`): `undefined` \| `S`

Returns the value of the first element in the array where predicate is true, and undefined
otherwise.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `S` | extends [`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `predicate` | (`this`: `void`, `value`: [`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`, `index`: `number`, `obj`: ([`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`)[]) => value is S | find calls predicate once for each element of the array, in ascending order, until it finds one where predicate returns true. If such an element is found, find immediately returns that element value. Otherwise, find returns undefined. |
| `thisArg?` | `any` | If provided, it will be used as the this value for each invocation of predicate. If it is not provided, undefined is used instead. |

#### Returns

`undefined` \| `S`

#### Inherited from

Array.find

#### Defined in

node_modules/typescript/lib/lib.es2015.core.d.ts:31

▸ **find**(`predicate`, `thisArg?`): `undefined` \| [`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`

#### Parameters

| Name | Type |
| :------ | :------ |
| `predicate` | (`value`: [`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`, `index`: `number`, `obj`: ([`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`)[]) => `unknown` |
| `thisArg?` | `any` |

#### Returns

`undefined` \| [`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`

#### Inherited from

Array.find

#### Defined in

node_modules/typescript/lib/lib.es2015.core.d.ts:32

___

### findIndex

▸ **findIndex**(`predicate`, `thisArg?`): `number`

Returns the index of the first element in the array where predicate is true, and -1
otherwise.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `predicate` | (`value`: [`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`, `index`: `number`, `obj`: ([`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`)[]) => `unknown` | find calls predicate once for each element of the array, in ascending order, until it finds one where predicate returns true. If such an element is found, findIndex immediately returns that element index. Otherwise, findIndex returns -1. |
| `thisArg?` | `any` | If provided, it will be used as the this value for each invocation of predicate. If it is not provided, undefined is used instead. |

#### Returns

`number`

#### Inherited from

Array.findIndex

#### Defined in

node_modules/typescript/lib/lib.es2015.core.d.ts:43

___

### flat

▸ **flat**<`A`, `D`\>(`this`, `depth?`): `FlatArray`<`A`, `D`\>[]

Returns a new array with all sub-array elements concatenated into it recursively up to the
specified depth.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `A` | `A` |
| `D` | extends `number` = ``1`` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `this` | `A` | - |
| `depth?` | `D` | The maximum recursion depth |

#### Returns

`FlatArray`<`A`, `D`\>[]

#### Inherited from

Array.flat

#### Defined in

node_modules/typescript/lib/lib.es2019.array.d.ts:81

___

### flatMap

▸ **flatMap**<`U`, `This`\>(`callback`, `thisArg?`): `U`[]

Calls a defined callback function on each element of an array. Then, flattens the result into
a new array.
This is identical to a map followed by flat with depth 1.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `U` | `U` |
| `This` | `undefined` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callback` | (`this`: `This`, `value`: [`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`, `index`: `number`, `array`: ([`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`)[]) => `U` \| readonly `U`[] | A function that accepts up to three arguments. The flatMap method calls the callback function one time for each element in the array. |
| `thisArg?` | `This` | An object to which the this keyword can refer in the callback function. If thisArg is omitted, undefined is used as the this value. |

#### Returns

`U`[]

#### Inherited from

Array.flatMap

#### Defined in

node_modules/typescript/lib/lib.es2019.array.d.ts:70

___

### forEach

▸ **forEach**(`callbackfn`, `thisArg?`): `void`

Performs the specified action for each element in an array.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callbackfn` | (`value`: [`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`, `index`: `number`, `array`: ([`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`)[]) => `void` | A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array. |
| `thisArg?` | `any` | An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value. |

#### Returns

`void`

#### Inherited from

Array.forEach

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1435

___

### includes

▸ **includes**(`searchElement`, `fromIndex?`): `boolean`

Determines whether an array includes a certain element, returning true or false as appropriate.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `searchElement` | [`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap` | The element to search for. |
| `fromIndex?` | `number` | The position in this array at which to begin searching for searchElement. |

#### Returns

`boolean`

#### Inherited from

Array.includes

#### Defined in

node_modules/typescript/lib/lib.es2016.array.include.d.ts:27

___

### indexOf

▸ **indexOf**(`searchElement`, `fromIndex?`): `number`

Returns the index of the first occurrence of a value in an array, or -1 if it is not present.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `searchElement` | [`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap` | The value to locate in the array. |
| `fromIndex?` | `number` | The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0. |

#### Returns

`number`

#### Inherited from

Array.indexOf

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1396

___

### join

▸ **join**(`separator?`): `string`

Adds all the elements of an array into a string, separated by the specified separator string.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `separator?` | `string` | A string used to separate one element of the array from the next in the resulting string. If omitted, the array elements are separated with a comma. |

#### Returns

`string`

#### Inherited from

Array.join

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1339

___

### keys

▸ **keys**(): `IterableIterator`<`number`\>

Returns an iterable of keys in the array

#### Returns

`IterableIterator`<`number`\>

#### Inherited from

Array.keys

#### Defined in

node_modules/typescript/lib/lib.es2015.iterable.d.ts:70

___

### lastIndexOf

▸ **lastIndexOf**(`searchElement`, `fromIndex?`): `number`

Returns the index of the last occurrence of a specified value in an array, or -1 if it is not present.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `searchElement` | [`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap` | The value to locate in the array. |
| `fromIndex?` | `number` | The array index at which to begin searching backward. If fromIndex is omitted, the search starts at the last index in the array. |

#### Returns

`number`

#### Inherited from

Array.lastIndexOf

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1402

___

### map

▸ **map**<`U`\>(`callbackfn`, `thisArg?`): `U`[]

Calls a defined callback function on each element of an array, and returns an array that contains the results.

#### Type parameters

| Name |
| :------ |
| `U` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callbackfn` | (`value`: [`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`, `index`: `number`, `array`: ([`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`)[]) => `U` | A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array. |
| `thisArg?` | `any` | An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value. |

#### Returns

`U`[]

#### Inherited from

Array.map

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1441

___

### pop

▸ **pop**(): `undefined` \| [`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`

Removes the last element from an array and returns it.
If the array is empty, undefined is returned and the array is not modified.

#### Returns

`undefined` \| [`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`

#### Inherited from

Array.pop

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1317

___

### push

▸ **push**(`...items`): `number`

Appends new elements to the end of an array, and returns the new length of the array.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...items` | ([`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`)[] | New elements to add to the array. |

#### Returns

`number`

#### Inherited from

Array.push

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1322

___

### reduce

▸ **reduce**(`callbackfn`): [`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`

Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callbackfn` | (`previousValue`: [`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`, `currentValue`: [`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`, `currentIndex`: `number`, `array`: ([`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`)[]) => [`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap` | A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array. |

#### Returns

[`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`

#### Inherited from

Array.reduce

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1459

▸ **reduce**(`callbackfn`, `initialValue`): [`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`

#### Parameters

| Name | Type |
| :------ | :------ |
| `callbackfn` | (`previousValue`: [`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`, `currentValue`: [`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`, `currentIndex`: `number`, `array`: ([`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`)[]) => [`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap` |
| `initialValue` | [`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap` |

#### Returns

[`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`

#### Inherited from

Array.reduce

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1460

▸ **reduce**<`U`\>(`callbackfn`, `initialValue`): `U`

Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.

#### Type parameters

| Name |
| :------ |
| `U` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callbackfn` | (`previousValue`: `U`, `currentValue`: [`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`, `currentIndex`: `number`, `array`: ([`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`)[]) => `U` | A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array. |
| `initialValue` | `U` | If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value. |

#### Returns

`U`

#### Inherited from

Array.reduce

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1466

___

### reduceRight

▸ **reduceRight**(`callbackfn`): [`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`

Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callbackfn` | (`previousValue`: [`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`, `currentValue`: [`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`, `currentIndex`: `number`, `array`: ([`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`)[]) => [`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap` | A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array. |

#### Returns

[`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`

#### Inherited from

Array.reduceRight

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1472

▸ **reduceRight**(`callbackfn`, `initialValue`): [`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`

#### Parameters

| Name | Type |
| :------ | :------ |
| `callbackfn` | (`previousValue`: [`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`, `currentValue`: [`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`, `currentIndex`: `number`, `array`: ([`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`)[]) => [`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap` |
| `initialValue` | [`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap` |

#### Returns

[`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`

#### Inherited from

Array.reduceRight

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1473

▸ **reduceRight**<`U`\>(`callbackfn`, `initialValue`): `U`

Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.

#### Type parameters

| Name |
| :------ |
| `U` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callbackfn` | (`previousValue`: `U`, `currentValue`: [`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`, `currentIndex`: `number`, `array`: ([`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`)[]) => `U` | A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array. |
| `initialValue` | `U` | If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value. |

#### Returns

`U`

#### Inherited from

Array.reduceRight

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1479

___

### reverse

▸ **reverse**(): ([`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`)[]

Reverses the elements in an array in place.
This method mutates the array and returns a reference to the same array.

#### Returns

([`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`)[]

#### Inherited from

Array.reverse

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1344

___

### shift

▸ **shift**(): `undefined` \| [`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`

Removes the first element from an array and returns it.
If the array is empty, undefined is returned and the array is not modified.

#### Returns

`undefined` \| [`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`

#### Inherited from

Array.shift

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1349

___

### slice

▸ **slice**(`start?`, `end?`): ([`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`)[]

Returns a copy of a section of an array.
For both start and end, a negative index can be used to indicate an offset from the end of the array.
For example, -2 refers to the second to last element of the array.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `start?` | `number` | The beginning index of the specified portion of the array. If start is undefined, then the slice begins at index 0. |
| `end?` | `number` | The end index of the specified portion of the array. This is exclusive of the element at the index 'end'. If end is undefined, then the slice extends to the end of the array. |

#### Returns

([`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`)[]

#### Inherited from

Array.slice

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1359

___

### some

▸ **some**(`predicate`, `thisArg?`): `boolean`

Determines whether the specified callback function returns true for any element of an array.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `predicate` | (`value`: [`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`, `index`: `number`, `array`: ([`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`)[]) => `unknown` | A function that accepts up to three arguments. The some method calls the predicate function for each element in the array until the predicate returns a value which is coercible to the Boolean value true, or until the end of the array. |
| `thisArg?` | `any` | An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value. |

#### Returns

`boolean`

#### Inherited from

Array.some

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1429

___

### sort

▸ **sort**(`compareFn?`): [`TextureCache`](../wiki/TextureCache)

Sorts an array in place.
This method mutates the array and returns a reference to the same array.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `compareFn?` | (`a`: [`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`, `b`: [`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`) => `number` | Function used to determine the order of the elements. It is expected to return a negative value if the first argument is less than the second argument, zero if they're equal, and a positive value otherwise. If omitted, the elements are sorted in ascending, ASCII character order. ```ts [11,2,22,1].sort((a, b) => a - b) ``` |

#### Returns

[`TextureCache`](../wiki/TextureCache)

#### Inherited from

Array.sort

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1370

___

### splice

▸ **splice**(`start`, `deleteCount?`): ([`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`)[]

Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `start` | `number` | The zero-based location in the array from which to start removing elements. |
| `deleteCount?` | `number` | The number of elements to remove. |

#### Returns

([`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`)[]

An array containing the elements that were deleted.

#### Inherited from

Array.splice

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1377

▸ **splice**(`start`, `deleteCount`, `...items`): ([`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`)[]

Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `start` | `number` | The zero-based location in the array from which to start removing elements. |
| `deleteCount` | `number` | The number of elements to remove. |
| `...items` | ([`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`)[] | Elements to insert into the array in place of the deleted elements. |

#### Returns

([`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`)[]

An array containing the elements that were deleted.

#### Inherited from

Array.splice

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1385

___

### toLocaleString

▸ **toLocaleString**(): `string`

Returns a string representation of an array. The elements are converted to string using their toLocaleString methods.

#### Returns

`string`

#### Inherited from

Array.toLocaleString

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1312

___

### toString

▸ **toString**(): `string`

Returns a string representation of an array.

#### Returns

`string`

#### Inherited from

Array.toString

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1308

___

### unshift

▸ **unshift**(`...items`): `number`

Inserts new elements at the start of an array, and returns the new length of the array.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...items` | ([`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`)[] | Elements to insert at the start of the array. |

#### Returns

`number`

#### Inherited from

Array.unshift

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1390

___

### values

▸ **values**(): `IterableIterator`<[`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`\>

Returns an iterable of values in the array

#### Returns

`IterableIterator`<[`CanvasLike`](../wiki/Home#canvaslike) \| `ImageBitmap`\>

#### Inherited from

Array.values

#### Defined in

node_modules/typescript/lib/lib.es2015.iterable.d.ts:75

___

### from

▸ `Static` **from**<`T`\>(`arrayLike`): `T`[]

Creates an array from an array-like object.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `arrayLike` | `ArrayLike`<`T`\> | An array-like object to convert to an array. |

#### Returns

`T`[]

#### Inherited from

Array.from

#### Defined in

node_modules/typescript/lib/lib.es2015.core.d.ts:72

▸ `Static` **from**<`T`, `U`\>(`arrayLike`, `mapfn`, `thisArg?`): `U`[]

Creates an array from an iterable object.

#### Type parameters

| Name |
| :------ |
| `T` |
| `U` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `arrayLike` | `ArrayLike`<`T`\> | An array-like object to convert to an array. |
| `mapfn` | (`v`: `T`, `k`: `number`) => `U` | A mapping function to call on every element of the array. |
| `thisArg?` | `any` | Value of 'this' used to invoke the mapfn. |

#### Returns

`U`[]

#### Inherited from

Array.from

#### Defined in

node_modules/typescript/lib/lib.es2015.core.d.ts:80

▸ `Static` **from**<`T`\>(`iterable`): `T`[]

Creates an array from an iterable object.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `iterable` | `Iterable`<`T`\> \| `ArrayLike`<`T`\> | An iterable object to convert to an array. |

#### Returns

`T`[]

#### Inherited from

Array.from

#### Defined in

node_modules/typescript/lib/lib.es2015.iterable.d.ts:83

▸ `Static` **from**<`T`, `U`\>(`iterable`, `mapfn`, `thisArg?`): `U`[]

Creates an array from an iterable object.

#### Type parameters

| Name |
| :------ |
| `T` |
| `U` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `iterable` | `Iterable`<`T`\> \| `ArrayLike`<`T`\> | An iterable object to convert to an array. |
| `mapfn` | (`v`: `T`, `k`: `number`) => `U` | A mapping function to call on every element of the array. |
| `thisArg?` | `any` | Value of 'this' used to invoke the mapfn. |

#### Returns

`U`[]

#### Inherited from

Array.from

#### Defined in

node_modules/typescript/lib/lib.es2015.iterable.d.ts:91

___

### isArray

▸ `Static` **isArray**(`arg`): arg is any[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `arg` | `any` |

#### Returns

arg is any[]

#### Inherited from

Array.isArray

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1491

___

### of

▸ `Static` **of**<`T`\>(`...items`): `T`[]

Returns a new array from a set of elements.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...items` | `T`[] | A set of elements to include in the new array object. |

#### Returns

`T`[]

#### Inherited from

Array.of

#### Defined in

node_modules/typescript/lib/lib.es2015.core.d.ts:86
