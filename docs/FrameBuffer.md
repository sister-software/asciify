# Class: FrameBuffer

## Hierarchy

- `Uint8ClampedArray`

  ↳ **`FrameBuffer`**

## Table of contents

### Constructors

- [constructor](../wiki/FrameBuffer#constructor)

### Properties

- [BYTES\_PER\_ELEMENT](../wiki/FrameBuffer#bytes_per_element)
- [[toStringTag]](../wiki/FrameBuffer#%5Btostringtag%5D)
- [buffer](../wiki/FrameBuffer#buffer)
- [byteLength](../wiki/FrameBuffer#bytelength)
- [byteOffset](../wiki/FrameBuffer#byteoffset)
- [length](../wiki/FrameBuffer#length)
- [BYTES\_PER\_ELEMENT](../wiki/FrameBuffer#bytes_per_element-1)

### Methods

- [[iterator]](../wiki/FrameBuffer#%5Biterator%5D)
- [at](../wiki/FrameBuffer#at)
- [copyWithin](../wiki/FrameBuffer#copywithin)
- [entries](../wiki/FrameBuffer#entries)
- [every](../wiki/FrameBuffer#every)
- [fill](../wiki/FrameBuffer#fill)
- [filter](../wiki/FrameBuffer#filter)
- [find](../wiki/FrameBuffer#find)
- [findIndex](../wiki/FrameBuffer#findindex)
- [forEach](../wiki/FrameBuffer#foreach)
- [includes](../wiki/FrameBuffer#includes)
- [indexOf](../wiki/FrameBuffer#indexof)
- [join](../wiki/FrameBuffer#join)
- [keys](../wiki/FrameBuffer#keys)
- [lastIndexOf](../wiki/FrameBuffer#lastindexof)
- [map](../wiki/FrameBuffer#map)
- [reduce](../wiki/FrameBuffer#reduce)
- [reduceRight](../wiki/FrameBuffer#reduceright)
- [reverse](../wiki/FrameBuffer#reverse)
- [set](../wiki/FrameBuffer#set)
- [slice](../wiki/FrameBuffer#slice)
- [some](../wiki/FrameBuffer#some)
- [sort](../wiki/FrameBuffer#sort)
- [subarray](../wiki/FrameBuffer#subarray)
- [toLocaleString](../wiki/FrameBuffer#tolocalestring)
- [toString](../wiki/FrameBuffer#tostring)
- [valueOf](../wiki/FrameBuffer#valueof)
- [values](../wiki/FrameBuffer#values)
- [from](../wiki/FrameBuffer#from)
- [of](../wiki/FrameBuffer#of)

## Constructors

### constructor

• **new FrameBuffer**(`rowCount`, `columnCount`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `rowCount` | `number` |
| `columnCount` | `number` |

#### Overrides

Uint8ClampedArray.constructor

#### Defined in

[utils/readers.mts:15](https://github.com/sister-software/asciify/blob/86cb63b/utils/readers.mts#L15)

## Properties

### BYTES\_PER\_ELEMENT

• `Readonly` **BYTES\_PER\_ELEMENT**: `number`

The size in bytes of each element in the array.

#### Inherited from

Uint8ClampedArray.BYTES\_PER\_ELEMENT

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:2415

___

### [toStringTag]

• `Readonly` **[toStringTag]**: ``"Uint8ClampedArray"``

#### Inherited from

Uint8ClampedArray.\_\_@toStringTag@1577

#### Defined in

node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:286

___

### buffer

• `Readonly` **buffer**: `ArrayBufferLike`

The ArrayBuffer instance referenced by the array.

#### Inherited from

Uint8ClampedArray.buffer

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:2420

___

### byteLength

• `Readonly` **byteLength**: `number`

The length in bytes of the array.

#### Inherited from

Uint8ClampedArray.byteLength

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:2425

___

### byteOffset

• `Readonly` **byteOffset**: `number`

The offset in bytes of the array.

#### Inherited from

Uint8ClampedArray.byteOffset

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:2430

___

### length

• `Readonly` **length**: `number`

The length of the array.

#### Inherited from

Uint8ClampedArray.length

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:2529

___

### BYTES\_PER\_ELEMENT

▪ `Static` `Readonly` **BYTES\_PER\_ELEMENT**: `number`

The size in bytes of each element in the array.

#### Inherited from

Uint8ClampedArray.BYTES\_PER\_ELEMENT

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:2664

## Methods

### [iterator]

▸ **[iterator]**(): `IterableIterator`<`number`\>

#### Returns

`IterableIterator`<`number`\>

#### Inherited from

Uint8ClampedArray.\_\_@iterator@243

#### Defined in

node_modules/typescript/lib/lib.es2015.iterable.d.ts:300

___

### at

▸ **at**(`index`): `undefined` \| `number`

Returns the item located at the specified index.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `index` | `number` | The zero-based index of the desired code unit. A negative index will count back from the last item. |

#### Returns

`undefined` \| `number`

#### Inherited from

Uint8ClampedArray.at

#### Defined in

node_modules/typescript/lib/lib.es2022.array.d.ts:58

___

### copyWithin

▸ **copyWithin**(`target`, `start`, `end?`): [`FrameBuffer`](../wiki/FrameBuffer)

Returns the this object after copying a section of the array identified by start and end
to the same array starting at position target

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | `number` | If target is negative, it is treated as length+target where length is the length of the array. |
| `start` | `number` | If start is negative, it is treated as length+start. If end is negative, it is treated as length+end. |
| `end?` | `number` | If not specified, length of the this object is used as its default value. |

#### Returns

[`FrameBuffer`](../wiki/FrameBuffer)

#### Inherited from

Uint8ClampedArray.copyWithin

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:2441

___

### entries

▸ **entries**(): `IterableIterator`<[`number`, `number`]\>

Returns an array of key, value pairs for every entry in the array

#### Returns

`IterableIterator`<[`number`, `number`]\>

#### Inherited from

Uint8ClampedArray.entries

#### Defined in

node_modules/typescript/lib/lib.es2015.iterable.d.ts:304

___

### every

▸ **every**(`predicate`, `thisArg?`): `boolean`

Determines whether all the members of an array satisfy the specified test.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `predicate` | (`value`: `number`, `index`: `number`, `array`: `Uint8ClampedArray`) => `unknown` | A function that accepts up to three arguments. The every method calls the predicate function for each element in the array until the predicate returns a value which is coercible to the Boolean value false, or until the end of the array. |
| `thisArg?` | `any` | An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value. |

#### Returns

`boolean`

#### Inherited from

Uint8ClampedArray.every

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:2451

___

### fill

▸ **fill**(`value`, `start?`, `end?`): [`FrameBuffer`](../wiki/FrameBuffer)

Changes all array elements from `start` to `end` index to a static `value` and returns the modified array

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `number` | value to fill array section with |
| `start?` | `number` | index to start filling the array at. If start is negative, it is treated as length+start where length is the length of the array. |
| `end?` | `number` | index to stop filling the array at. If end is negative, it is treated as length+end. |

#### Returns

[`FrameBuffer`](../wiki/FrameBuffer)

#### Inherited from

Uint8ClampedArray.fill

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:2461

___

### filter

▸ **filter**(`predicate`, `thisArg?`): `Uint8ClampedArray`

Returns the elements of an array that meet the condition specified in a callback function.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `predicate` | (`value`: `number`, `index`: `number`, `array`: `Uint8ClampedArray`) => `any` | A function that accepts up to three arguments. The filter method calls the predicate function one time for each element in the array. |
| `thisArg?` | `any` | An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value. |

#### Returns

`Uint8ClampedArray`

#### Inherited from

Uint8ClampedArray.filter

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:2470

___

### find

▸ **find**(`predicate`, `thisArg?`): `undefined` \| `number`

Returns the value of the first element in the array where predicate is true, and undefined
otherwise.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `predicate` | (`value`: `number`, `index`: `number`, `obj`: `Uint8ClampedArray`) => `boolean` | find calls predicate once for each element of the array, in ascending order, until it finds one where predicate returns true. If such an element is found, find immediately returns that element value. Otherwise, find returns undefined. |
| `thisArg?` | `any` | If provided, it will be used as the this value for each invocation of predicate. If it is not provided, undefined is used instead. |

#### Returns

`undefined` \| `number`

#### Inherited from

Uint8ClampedArray.find

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:2481

___

### findIndex

▸ **findIndex**(`predicate`, `thisArg?`): `number`

Returns the index of the first element in the array where predicate is true, and -1
otherwise.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `predicate` | (`value`: `number`, `index`: `number`, `obj`: `Uint8ClampedArray`) => `boolean` | find calls predicate once for each element of the array, in ascending order, until it finds one where predicate returns true. If such an element is found, findIndex immediately returns that element index. Otherwise, findIndex returns -1. |
| `thisArg?` | `any` | If provided, it will be used as the this value for each invocation of predicate. If it is not provided, undefined is used instead. |

#### Returns

`number`

#### Inherited from

Uint8ClampedArray.findIndex

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:2492

___

### forEach

▸ **forEach**(`callbackfn`, `thisArg?`): `void`

Performs the specified action for each element in an array.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callbackfn` | (`value`: `number`, `index`: `number`, `array`: `Uint8ClampedArray`) => `void` | A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array. |
| `thisArg?` | `any` | An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value. |

#### Returns

`void`

#### Inherited from

Uint8ClampedArray.forEach

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:2501

___

### includes

▸ **includes**(`searchElement`, `fromIndex?`): `boolean`

Determines whether an array includes a certain element, returning true or false as appropriate.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `searchElement` | `number` | The element to search for. |
| `fromIndex?` | `number` | The position in this array at which to begin searching for searchElement. |

#### Returns

`boolean`

#### Inherited from

Uint8ClampedArray.includes

#### Defined in

node_modules/typescript/lib/lib.es2016.array.include.d.ts:63

___

### indexOf

▸ **indexOf**(`searchElement`, `fromIndex?`): `number`

Returns the index of the first occurrence of a value in an array.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `searchElement` | `number` | The value to locate in the array. |
| `fromIndex?` | `number` | The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0. |

#### Returns

`number`

#### Inherited from

Uint8ClampedArray.indexOf

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:2509

___

### join

▸ **join**(`separator?`): `string`

Adds all the elements of an array separated by the specified separator string.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `separator?` | `string` | A string used to separate one element of an array from the next in the resulting String. If omitted, the array elements are separated with a comma. |

#### Returns

`string`

#### Inherited from

Uint8ClampedArray.join

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:2516

___

### keys

▸ **keys**(): `IterableIterator`<`number`\>

Returns an list of keys in the array

#### Returns

`IterableIterator`<`number`\>

#### Inherited from

Uint8ClampedArray.keys

#### Defined in

node_modules/typescript/lib/lib.es2015.iterable.d.ts:309

___

### lastIndexOf

▸ **lastIndexOf**(`searchElement`, `fromIndex?`): `number`

Returns the index of the last occurrence of a value in an array.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `searchElement` | `number` | The value to locate in the array. |
| `fromIndex?` | `number` | The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0. |

#### Returns

`number`

#### Inherited from

Uint8ClampedArray.lastIndexOf

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:2524

___

### map

▸ **map**(`callbackfn`, `thisArg?`): `Uint8ClampedArray`

Calls a defined callback function on each element of an array, and returns an array that
contains the results.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callbackfn` | (`value`: `number`, `index`: `number`, `array`: `Uint8ClampedArray`) => `number` | A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array. |
| `thisArg?` | `any` | An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value. |

#### Returns

`Uint8ClampedArray`

#### Inherited from

Uint8ClampedArray.map

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:2539

___

### reduce

▸ **reduce**(`callbackfn`): `number`

Calls the specified callback function for all the elements in an array. The return value of
the callback function is the accumulated result, and is provided as an argument in the next
call to the callback function.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callbackfn` | (`previousValue`: `number`, `currentValue`: `number`, `currentIndex`: `number`, `array`: `Uint8ClampedArray`) => `number` | A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array. |

#### Returns

`number`

#### Inherited from

Uint8ClampedArray.reduce

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:2551

▸ **reduce**(`callbackfn`, `initialValue`): `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `callbackfn` | (`previousValue`: `number`, `currentValue`: `number`, `currentIndex`: `number`, `array`: `Uint8ClampedArray`) => `number` |
| `initialValue` | `number` |

#### Returns

`number`

#### Inherited from

Uint8ClampedArray.reduce

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:2552

▸ **reduce**<`U`\>(`callbackfn`, `initialValue`): `U`

Calls the specified callback function for all the elements in an array. The return value of
the callback function is the accumulated result, and is provided as an argument in the next
call to the callback function.

#### Type parameters

| Name |
| :------ |
| `U` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callbackfn` | (`previousValue`: `U`, `currentValue`: `number`, `currentIndex`: `number`, `array`: `Uint8ClampedArray`) => `U` | A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array. |
| `initialValue` | `U` | If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value. |

#### Returns

`U`

#### Inherited from

Uint8ClampedArray.reduce

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:2564

___

### reduceRight

▸ **reduceRight**(`callbackfn`): `number`

Calls the specified callback function for all the elements in an array, in descending order.
The return value of the callback function is the accumulated result, and is provided as an
argument in the next call to the callback function.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callbackfn` | (`previousValue`: `number`, `currentValue`: `number`, `currentIndex`: `number`, `array`: `Uint8ClampedArray`) => `number` | A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array. |

#### Returns

`number`

#### Inherited from

Uint8ClampedArray.reduceRight

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:2576

▸ **reduceRight**(`callbackfn`, `initialValue`): `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `callbackfn` | (`previousValue`: `number`, `currentValue`: `number`, `currentIndex`: `number`, `array`: `Uint8ClampedArray`) => `number` |
| `initialValue` | `number` |

#### Returns

`number`

#### Inherited from

Uint8ClampedArray.reduceRight

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:2577

▸ **reduceRight**<`U`\>(`callbackfn`, `initialValue`): `U`

Calls the specified callback function for all the elements in an array, in descending order.
The return value of the callback function is the accumulated result, and is provided as an
argument in the next call to the callback function.

#### Type parameters

| Name |
| :------ |
| `U` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callbackfn` | (`previousValue`: `U`, `currentValue`: `number`, `currentIndex`: `number`, `array`: `Uint8ClampedArray`) => `U` | A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array. |
| `initialValue` | `U` | If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value. |

#### Returns

`U`

#### Inherited from

Uint8ClampedArray.reduceRight

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:2589

___

### reverse

▸ **reverse**(): `Uint8ClampedArray`

Reverses the elements in an Array.

#### Returns

`Uint8ClampedArray`

#### Inherited from

Uint8ClampedArray.reverse

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:2594

___

### set

▸ **set**(`array`, `offset?`): `void`

Sets a value or an array of values.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `array` | `ArrayLike`<`number`\> | A typed or untyped array of values to set. |
| `offset?` | `number` | The index in the current array at which the values are to be written. |

#### Returns

`void`

#### Inherited from

Uint8ClampedArray.set

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:2601

___

### slice

▸ **slice**(`start?`, `end?`): `Uint8ClampedArray`

Returns a section of an array.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `start?` | `number` | The beginning of the specified portion of the array. |
| `end?` | `number` | The end of the specified portion of the array. This is exclusive of the element at the index 'end'. |

#### Returns

`Uint8ClampedArray`

#### Inherited from

Uint8ClampedArray.slice

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:2608

___

### some

▸ **some**(`predicate`, `thisArg?`): `boolean`

Determines whether the specified callback function returns true for any element of an array.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `predicate` | (`value`: `number`, `index`: `number`, `array`: `Uint8ClampedArray`) => `unknown` | A function that accepts up to three arguments. The some method calls the predicate function for each element in the array until the predicate returns a value which is coercible to the Boolean value true, or until the end of the array. |
| `thisArg?` | `any` | An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value. |

#### Returns

`boolean`

#### Inherited from

Uint8ClampedArray.some

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:2618

___

### sort

▸ **sort**(`compareFn?`): [`FrameBuffer`](../wiki/FrameBuffer)

Sorts an array.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `compareFn?` | (`a`: `number`, `b`: `number`) => `number` | Function used to determine the order of the elements. It is expected to return a negative value if first argument is less than second argument, zero if they're equal and a positive value otherwise. If omitted, the elements are sorted in ascending order. ```ts [11,2,22,1].sort((a, b) => a - b) ``` |

#### Returns

[`FrameBuffer`](../wiki/FrameBuffer)

#### Inherited from

Uint8ClampedArray.sort

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:2629

___

### subarray

▸ **subarray**(`begin?`, `end?`): `Uint8ClampedArray`

Gets a new Uint8ClampedArray view of the ArrayBuffer store for this array, referencing the elements
at begin, inclusive, up to end, exclusive.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `begin?` | `number` | The index of the beginning of the array. |
| `end?` | `number` | The index of the end of the array. |

#### Returns

`Uint8ClampedArray`

#### Inherited from

Uint8ClampedArray.subarray

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:2637

___

### toLocaleString

▸ **toLocaleString**(): `string`

Converts a number to a string by using the current locale.

#### Returns

`string`

#### Inherited from

Uint8ClampedArray.toLocaleString

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:2642

___

### toString

▸ **toString**(): `string`

Returns a string representation of an array.

#### Returns

`string`

#### Inherited from

Uint8ClampedArray.toString

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:2647

___

### valueOf

▸ **valueOf**(): `Uint8ClampedArray`

Returns the primitive value of the specified object.

#### Returns

`Uint8ClampedArray`

#### Inherited from

Uint8ClampedArray.valueOf

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:2650

___

### values

▸ **values**(): `IterableIterator`<`number`\>

Returns an list of values in the array

#### Returns

`IterableIterator`<`number`\>

#### Inherited from

Uint8ClampedArray.values

#### Defined in

node_modules/typescript/lib/lib.es2015.iterable.d.ts:314

___

### from

▸ `Static` **from**(`arrayLike`): `Uint8ClampedArray`

Creates an array from an array-like or iterable object.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `arrayLike` | `ArrayLike`<`number`\> | An array-like or iterable object to convert to an array. |

#### Returns

`Uint8ClampedArray`

#### Inherited from

Uint8ClampedArray.from

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:2676

▸ `Static` **from**<`T`\>(`arrayLike`, `mapfn`, `thisArg?`): `Uint8ClampedArray`

Creates an array from an array-like or iterable object.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `arrayLike` | `ArrayLike`<`T`\> | An array-like or iterable object to convert to an array. |
| `mapfn` | (`v`: `T`, `k`: `number`) => `number` | A mapping function to call on every element of the array. |
| `thisArg?` | `any` | Value of 'this' used to invoke the mapfn. |

#### Returns

`Uint8ClampedArray`

#### Inherited from

Uint8ClampedArray.from

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:2684

▸ `Static` **from**(`arrayLike`, `mapfn?`, `thisArg?`): `Uint8ClampedArray`

Creates an array from an array-like or iterable object.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `arrayLike` | `Iterable`<`number`\> | An array-like or iterable object to convert to an array. |
| `mapfn?` | (`v`: `number`, `k`: `number`) => `number` | A mapping function to call on every element of the array. |
| `thisArg?` | `any` | Value of 'this' used to invoke the mapfn. |

#### Returns

`Uint8ClampedArray`

#### Inherited from

Uint8ClampedArray.from

#### Defined in

node_modules/typescript/lib/lib.es2015.iterable.d.ts:327

___

### of

▸ `Static` **of**(`...items`): `Uint8ClampedArray`

Returns a new array from a set of elements.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...items` | `number`[] | A set of elements to include in the new array object. |

#### Returns

`Uint8ClampedArray`

#### Inherited from

Uint8ClampedArray.of

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:2670
