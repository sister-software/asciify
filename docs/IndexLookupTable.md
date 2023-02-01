# Class: IndexLookupTable

A precomputed lookup table to help us traverse the pixel buffer.

Each character cell is represented by six values:
```ts
[x1, y1, red1, green1, blue1, alpha1, xN, yN, redN, greenN, blueN, alphaN...]
```

The length of this array is equal to the area of the row and column counts.

## Hierarchy

- `Uint32Array`

  ↳ **`IndexLookupTable`**

## Table of contents

### Constructors

- [constructor](../wiki/IndexLookupTable#constructor)

### Properties

- [BYTES\_PER\_ELEMENT](../wiki/IndexLookupTable#bytes_per_element)
- [[toStringTag]](../wiki/IndexLookupTable#%5Btostringtag%5D)
- [buffer](../wiki/IndexLookupTable#buffer)
- [byteLength](../wiki/IndexLookupTable#bytelength)
- [byteOffset](../wiki/IndexLookupTable#byteoffset)
- [length](../wiki/IndexLookupTable#length)
- [BYTES\_PER\_ELEMENT](../wiki/IndexLookupTable#bytes_per_element-1)

### Methods

- [[iterator]](../wiki/IndexLookupTable#%5Biterator%5D)
- [at](../wiki/IndexLookupTable#at)
- [copyWithin](../wiki/IndexLookupTable#copywithin)
- [entries](../wiki/IndexLookupTable#entries)
- [every](../wiki/IndexLookupTable#every)
- [fill](../wiki/IndexLookupTable#fill)
- [filter](../wiki/IndexLookupTable#filter)
- [find](../wiki/IndexLookupTable#find)
- [findIndex](../wiki/IndexLookupTable#findindex)
- [forEach](../wiki/IndexLookupTable#foreach)
- [includes](../wiki/IndexLookupTable#includes)
- [indexOf](../wiki/IndexLookupTable#indexof)
- [join](../wiki/IndexLookupTable#join)
- [keys](../wiki/IndexLookupTable#keys)
- [lastIndexOf](../wiki/IndexLookupTable#lastindexof)
- [map](../wiki/IndexLookupTable#map)
- [reduce](../wiki/IndexLookupTable#reduce)
- [reduceRight](../wiki/IndexLookupTable#reduceright)
- [reverse](../wiki/IndexLookupTable#reverse)
- [set](../wiki/IndexLookupTable#set)
- [slice](../wiki/IndexLookupTable#slice)
- [some](../wiki/IndexLookupTable#some)
- [sort](../wiki/IndexLookupTable#sort)
- [subarray](../wiki/IndexLookupTable#subarray)
- [toLocaleString](../wiki/IndexLookupTable#tolocalestring)
- [toString](../wiki/IndexLookupTable#tostring)
- [valueOf](../wiki/IndexLookupTable#valueof)
- [values](../wiki/IndexLookupTable#values)
- [from](../wiki/IndexLookupTable#from)
- [of](../wiki/IndexLookupTable#of)

## Constructors

### constructor

• **new IndexLookupTable**(`rowCount`, `columnCount`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `rowCount` | `number` |
| `columnCount` | `number` |

#### Overrides

Uint32Array.constructor

#### Defined in

[utils.mts:154](https://github.com/sister-software/asciify/blob/836ead9/utils.mts#L154)

## Properties

### BYTES\_PER\_ELEMENT

• `Readonly` **BYTES\_PER\_ELEMENT**: `number`

The size in bytes of each element in the array.

#### Inherited from

Uint32Array.BYTES\_PER\_ELEMENT

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:3542

___

### [toStringTag]

• `Readonly` **[toStringTag]**: ``"Uint32Array"``

#### Inherited from

Uint32Array.\_\_@toStringTag@1579

#### Defined in

node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:302

___

### buffer

• `Readonly` **buffer**: `ArrayBufferLike`

The ArrayBuffer instance referenced by the array.

#### Inherited from

Uint32Array.buffer

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:3547

___

### byteLength

• `Readonly` **byteLength**: `number`

The length in bytes of the array.

#### Inherited from

Uint32Array.byteLength

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:3552

___

### byteOffset

• `Readonly` **byteOffset**: `number`

The offset in bytes of the array.

#### Inherited from

Uint32Array.byteOffset

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:3557

___

### length

• `Readonly` **length**: `number`

The length of the array.

#### Inherited from

Uint32Array.length

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:3655

___

### BYTES\_PER\_ELEMENT

▪ `Static` `Readonly` **BYTES\_PER\_ELEMENT**: `number`

The size in bytes of each element in the array.

#### Inherited from

Uint32Array.BYTES\_PER\_ELEMENT

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:3790

## Methods

### [iterator]

▸ **[iterator]**(): `IterableIterator`<`number`\>

#### Returns

`IterableIterator`<`number`\>

#### Inherited from

Uint32Array.\_\_@iterator@243

#### Defined in

node_modules/typescript/lib/lib.es2015.iterable.d.ts:417

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

Uint32Array.at

#### Defined in

node_modules/typescript/lib/lib.es2022.array.d.ts:90

___

### copyWithin

▸ **copyWithin**(`target`, `start`, `end?`): [`IndexLookupTable`](../wiki/IndexLookupTable)

Returns the this object after copying a section of the array identified by start and end
to the same array starting at position target

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | `number` | If target is negative, it is treated as length+target where length is the length of the array. |
| `start` | `number` | If start is negative, it is treated as length+start. If end is negative, it is treated as length+end. |
| `end?` | `number` | If not specified, length of the this object is used as its default value. |

#### Returns

[`IndexLookupTable`](../wiki/IndexLookupTable)

#### Inherited from

Uint32Array.copyWithin

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:3568

___

### entries

▸ **entries**(): `IterableIterator`<[`number`, `number`]\>

Returns an array of key, value pairs for every entry in the array

#### Returns

`IterableIterator`<[`number`, `number`]\>

#### Inherited from

Uint32Array.entries

#### Defined in

node_modules/typescript/lib/lib.es2015.iterable.d.ts:421

___

### every

▸ **every**(`predicate`, `thisArg?`): `boolean`

Determines whether all the members of an array satisfy the specified test.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `predicate` | (`value`: `number`, `index`: `number`, `array`: `Uint32Array`) => `unknown` | A function that accepts up to three arguments. The every method calls the predicate function for each element in the array until the predicate returns a value which is coercible to the Boolean value false, or until the end of the array. |
| `thisArg?` | `any` | An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value. |

#### Returns

`boolean`

#### Inherited from

Uint32Array.every

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:3578

___

### fill

▸ **fill**(`value`, `start?`, `end?`): [`IndexLookupTable`](../wiki/IndexLookupTable)

Changes all array elements from `start` to `end` index to a static `value` and returns the modified array

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `number` | value to fill array section with |
| `start?` | `number` | index to start filling the array at. If start is negative, it is treated as length+start where length is the length of the array. |
| `end?` | `number` | index to stop filling the array at. If end is negative, it is treated as length+end. |

#### Returns

[`IndexLookupTable`](../wiki/IndexLookupTable)

#### Inherited from

Uint32Array.fill

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:3588

___

### filter

▸ **filter**(`predicate`, `thisArg?`): `Uint32Array`

Returns the elements of an array that meet the condition specified in a callback function.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `predicate` | (`value`: `number`, `index`: `number`, `array`: `Uint32Array`) => `any` | A function that accepts up to three arguments. The filter method calls the predicate function one time for each element in the array. |
| `thisArg?` | `any` | An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value. |

#### Returns

`Uint32Array`

#### Inherited from

Uint32Array.filter

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:3597

___

### find

▸ **find**(`predicate`, `thisArg?`): `undefined` \| `number`

Returns the value of the first element in the array where predicate is true, and undefined
otherwise.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `predicate` | (`value`: `number`, `index`: `number`, `obj`: `Uint32Array`) => `boolean` | find calls predicate once for each element of the array, in ascending order, until it finds one where predicate returns true. If such an element is found, find immediately returns that element value. Otherwise, find returns undefined. |
| `thisArg?` | `any` | If provided, it will be used as the this value for each invocation of predicate. If it is not provided, undefined is used instead. |

#### Returns

`undefined` \| `number`

#### Inherited from

Uint32Array.find

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:3608

___

### findIndex

▸ **findIndex**(`predicate`, `thisArg?`): `number`

Returns the index of the first element in the array where predicate is true, and -1
otherwise.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `predicate` | (`value`: `number`, `index`: `number`, `obj`: `Uint32Array`) => `boolean` | find calls predicate once for each element of the array, in ascending order, until it finds one where predicate returns true. If such an element is found, findIndex immediately returns that element index. Otherwise, findIndex returns -1. |
| `thisArg?` | `any` | If provided, it will be used as the this value for each invocation of predicate. If it is not provided, undefined is used instead. |

#### Returns

`number`

#### Inherited from

Uint32Array.findIndex

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:3619

___

### forEach

▸ **forEach**(`callbackfn`, `thisArg?`): `void`

Performs the specified action for each element in an array.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callbackfn` | (`value`: `number`, `index`: `number`, `array`: `Uint32Array`) => `void` | A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array. |
| `thisArg?` | `any` | An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value. |

#### Returns

`void`

#### Inherited from

Uint32Array.forEach

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:3628

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

Uint32Array.includes

#### Defined in

node_modules/typescript/lib/lib.es2016.array.include.d.ts:99

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

Uint32Array.indexOf

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:3635

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

Uint32Array.join

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:3642

___

### keys

▸ **keys**(): `IterableIterator`<`number`\>

Returns an list of keys in the array

#### Returns

`IterableIterator`<`number`\>

#### Inherited from

Uint32Array.keys

#### Defined in

node_modules/typescript/lib/lib.es2015.iterable.d.ts:425

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

Uint32Array.lastIndexOf

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:3650

___

### map

▸ **map**(`callbackfn`, `thisArg?`): `Uint32Array`

Calls a defined callback function on each element of an array, and returns an array that
contains the results.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callbackfn` | (`value`: `number`, `index`: `number`, `array`: `Uint32Array`) => `number` | A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array. |
| `thisArg?` | `any` | An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value. |

#### Returns

`Uint32Array`

#### Inherited from

Uint32Array.map

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:3665

___

### reduce

▸ **reduce**(`callbackfn`): `number`

Calls the specified callback function for all the elements in an array. The return value of
the callback function is the accumulated result, and is provided as an argument in the next
call to the callback function.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callbackfn` | (`previousValue`: `number`, `currentValue`: `number`, `currentIndex`: `number`, `array`: `Uint32Array`) => `number` | A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array. |

#### Returns

`number`

#### Inherited from

Uint32Array.reduce

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:3677

▸ **reduce**(`callbackfn`, `initialValue`): `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `callbackfn` | (`previousValue`: `number`, `currentValue`: `number`, `currentIndex`: `number`, `array`: `Uint32Array`) => `number` |
| `initialValue` | `number` |

#### Returns

`number`

#### Inherited from

Uint32Array.reduce

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:3678

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
| `callbackfn` | (`previousValue`: `U`, `currentValue`: `number`, `currentIndex`: `number`, `array`: `Uint32Array`) => `U` | A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array. |
| `initialValue` | `U` | If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value. |

#### Returns

`U`

#### Inherited from

Uint32Array.reduce

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:3690

___

### reduceRight

▸ **reduceRight**(`callbackfn`): `number`

Calls the specified callback function for all the elements in an array, in descending order.
The return value of the callback function is the accumulated result, and is provided as an
argument in the next call to the callback function.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callbackfn` | (`previousValue`: `number`, `currentValue`: `number`, `currentIndex`: `number`, `array`: `Uint32Array`) => `number` | A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array. |

#### Returns

`number`

#### Inherited from

Uint32Array.reduceRight

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:3702

▸ **reduceRight**(`callbackfn`, `initialValue`): `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `callbackfn` | (`previousValue`: `number`, `currentValue`: `number`, `currentIndex`: `number`, `array`: `Uint32Array`) => `number` |
| `initialValue` | `number` |

#### Returns

`number`

#### Inherited from

Uint32Array.reduceRight

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:3703

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
| `callbackfn` | (`previousValue`: `U`, `currentValue`: `number`, `currentIndex`: `number`, `array`: `Uint32Array`) => `U` | A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array. |
| `initialValue` | `U` | If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value. |

#### Returns

`U`

#### Inherited from

Uint32Array.reduceRight

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:3715

___

### reverse

▸ **reverse**(): `Uint32Array`

Reverses the elements in an Array.

#### Returns

`Uint32Array`

#### Inherited from

Uint32Array.reverse

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:3720

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

Uint32Array.set

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:3727

___

### slice

▸ **slice**(`start?`, `end?`): `Uint32Array`

Returns a section of an array.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `start?` | `number` | The beginning of the specified portion of the array. |
| `end?` | `number` | The end of the specified portion of the array. This is exclusive of the element at the index 'end'. |

#### Returns

`Uint32Array`

#### Inherited from

Uint32Array.slice

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:3734

___

### some

▸ **some**(`predicate`, `thisArg?`): `boolean`

Determines whether the specified callback function returns true for any element of an array.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `predicate` | (`value`: `number`, `index`: `number`, `array`: `Uint32Array`) => `unknown` | A function that accepts up to three arguments. The some method calls the predicate function for each element in the array until the predicate returns a value which is coercible to the Boolean value true, or until the end of the array. |
| `thisArg?` | `any` | An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value. |

#### Returns

`boolean`

#### Inherited from

Uint32Array.some

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:3744

___

### sort

▸ **sort**(`compareFn?`): [`IndexLookupTable`](../wiki/IndexLookupTable)

Sorts an array.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `compareFn?` | (`a`: `number`, `b`: `number`) => `number` | Function used to determine the order of the elements. It is expected to return a negative value if first argument is less than second argument, zero if they're equal and a positive value otherwise. If omitted, the elements are sorted in ascending order. ```ts [11,2,22,1].sort((a, b) => a - b) ``` |

#### Returns

[`IndexLookupTable`](../wiki/IndexLookupTable)

#### Inherited from

Uint32Array.sort

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:3755

___

### subarray

▸ **subarray**(`begin?`, `end?`): `Uint32Array`

Gets a new Uint32Array view of the ArrayBuffer store for this array, referencing the elements
at begin, inclusive, up to end, exclusive.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `begin?` | `number` | The index of the beginning of the array. |
| `end?` | `number` | The index of the end of the array. |

#### Returns

`Uint32Array`

#### Inherited from

Uint32Array.subarray

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:3763

___

### toLocaleString

▸ **toLocaleString**(): `string`

Converts a number to a string by using the current locale.

#### Returns

`string`

#### Inherited from

Uint32Array.toLocaleString

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:3768

___

### toString

▸ **toString**(): `string`

Returns a string representation of an array.

#### Returns

`string`

#### Inherited from

Uint32Array.toString

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:3773

___

### valueOf

▸ **valueOf**(): `Uint32Array`

Returns the primitive value of the specified object.

#### Returns

`Uint32Array`

#### Inherited from

Uint32Array.valueOf

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:3776

___

### values

▸ **values**(): `IterableIterator`<`number`\>

Returns an list of values in the array

#### Returns

`IterableIterator`<`number`\>

#### Inherited from

Uint32Array.values

#### Defined in

node_modules/typescript/lib/lib.es2015.iterable.d.ts:429

___

### from

▸ `Static` **from**(`arrayLike`): `Uint32Array`

Creates an array from an array-like or iterable object.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `arrayLike` | `ArrayLike`<`number`\> | An array-like or iterable object to convert to an array. |

#### Returns

`Uint32Array`

#### Inherited from

Uint32Array.from

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:3802

▸ `Static` **from**<`T`\>(`arrayLike`, `mapfn`, `thisArg?`): `Uint32Array`

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

`Uint32Array`

#### Inherited from

Uint32Array.from

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:3810

▸ `Static` **from**(`arrayLike`, `mapfn?`, `thisArg?`): `Uint32Array`

Creates an array from an array-like or iterable object.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `arrayLike` | `Iterable`<`number`\> | An array-like or iterable object to convert to an array. |
| `mapfn?` | (`v`: `number`, `k`: `number`) => `number` | A mapping function to call on every element of the array. |
| `thisArg?` | `any` | Value of 'this' used to invoke the mapfn. |

#### Returns

`Uint32Array`

#### Inherited from

Uint32Array.from

#### Defined in

node_modules/typescript/lib/lib.es2015.iterable.d.ts:441

___

### of

▸ `Static` **of**(`...items`): `Uint32Array`

Returns a new array from a set of elements.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...items` | `number`[] | A set of elements to include in the new array object. |

#### Returns

`Uint32Array`

#### Inherited from

Uint32Array.of

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:3796
