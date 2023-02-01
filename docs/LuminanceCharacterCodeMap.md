# Class: LuminanceCharacterCodeMap

Given an array of 255 or less ASCII characters representing the brightness of each pixel,
returns something like a radix-sorted array of 255 characters that are evenly spaced.

This helps us avoid expensive operations like Math.floor() when rendering the ASCII art.

**`See`**

[`TypedOptimization::TryBuildCharacterCodeRadix`](https://github.com/v8/v8/blob/b584c57/src/compiler/typed-optimization.cc#L471)

## Hierarchy

- `Map`<`number`, `number`\>

  ↳ **`LuminanceCharacterCodeMap`**

## Table of contents

### Constructors

- [constructor](../wiki/LuminanceCharacterCodeMap#constructor)

### Properties

- [[toStringTag]](../wiki/LuminanceCharacterCodeMap#%5Btostringtag%5D)
- [characterSet](../wiki/LuminanceCharacterCodeMap#characterset)
- [size](../wiki/LuminanceCharacterCodeMap#size)
- [[species]](../wiki/LuminanceCharacterCodeMap#%5Bspecies%5D)

### Methods

- [[iterator]](../wiki/LuminanceCharacterCodeMap#%5Biterator%5D)
- [clear](../wiki/LuminanceCharacterCodeMap#clear)
- [delete](../wiki/LuminanceCharacterCodeMap#delete)
- [entries](../wiki/LuminanceCharacterCodeMap#entries)
- [forEach](../wiki/LuminanceCharacterCodeMap#foreach)
- [get](../wiki/LuminanceCharacterCodeMap#get)
- [has](../wiki/LuminanceCharacterCodeMap#has)
- [keys](../wiki/LuminanceCharacterCodeMap#keys)
- [set](../wiki/LuminanceCharacterCodeMap#set)
- [values](../wiki/LuminanceCharacterCodeMap#values)

## Constructors

### constructor

• **new LuminanceCharacterCodeMap**(`characterSet`, `contrastRatio`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `characterSet` | `string`[] |
| `contrastRatio` | `number` |

#### Overrides

Map&lt;
  /** The luminance of the pixel. 0 to 255. */
  number,
  /** The character code of the character to render. */
  number
\&gt;.constructor

#### Defined in

[utils.mts:113](https://github.com/sister-software/asciify/blob/9750ae3/utils.mts#L113)

## Properties

### [toStringTag]

• `Readonly` **[toStringTag]**: `string`

#### Inherited from

Map.\_\_@toStringTag@1577

#### Defined in

node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:135

___

### characterSet

• `Readonly` **characterSet**: `string`[]

#### Defined in

[utils.mts:113](https://github.com/sister-software/asciify/blob/9750ae3/utils.mts#L113)

___

### size

• `Readonly` **size**: `number`

#### Inherited from

Map.size

#### Defined in

node_modules/typescript/lib/lib.es2015.collection.d.ts:48

___

### [species]

▪ `Static` `Readonly` **[species]**: `MapConstructor`

#### Inherited from

Map.\_\_@species@1674

#### Defined in

node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:317

## Methods

### [iterator]

▸ **[iterator]**(): `IterableIterator`<[`number`, `number`]\>

Returns an iterable of entries in the map.

#### Returns

`IterableIterator`<[`number`, `number`]\>

#### Inherited from

Map.\_\_@iterator@243

#### Defined in

node_modules/typescript/lib/lib.es2015.iterable.d.ts:121

___

### clear

▸ **clear**(): `void`

#### Returns

`void`

#### Inherited from

Map.clear

#### Defined in

node_modules/typescript/lib/lib.es2015.collection.d.ts:23

___

### delete

▸ **delete**(`key`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `number` |

#### Returns

`boolean`

true if an element in the Map existed and has been removed, or false if the element does not exist.

#### Inherited from

Map.delete

#### Defined in

node_modules/typescript/lib/lib.es2015.collection.d.ts:27

___

### entries

▸ **entries**(): `IterableIterator`<[`number`, `number`]\>

Returns an iterable of key, value pairs for every entry in the map.

#### Returns

`IterableIterator`<[`number`, `number`]\>

#### Inherited from

Map.entries

#### Defined in

node_modules/typescript/lib/lib.es2015.iterable.d.ts:126

___

### forEach

▸ **forEach**(`callbackfn`, `thisArg?`): `void`

Executes a provided function once per each key/value pair in the Map, in insertion order.

#### Parameters

| Name | Type |
| :------ | :------ |
| `callbackfn` | (`value`: `number`, `key`: `number`, `map`: `Map`<`number`, `number`\>) => `void` |
| `thisArg?` | `any` |

#### Returns

`void`

#### Inherited from

Map.forEach

#### Defined in

node_modules/typescript/lib/lib.es2015.collection.d.ts:31

___

### get

▸ **get**(`key`): `undefined` \| `number`

Returns a specified element from the Map object. If the value that is associated to the provided key is an object, then you will get a reference to that object and any change made to that object will effectively modify it inside the Map.

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `number` |

#### Returns

`undefined` \| `number`

Returns the element associated with the specified key. If no element is associated with the specified key, undefined is returned.

#### Inherited from

Map.get

#### Defined in

node_modules/typescript/lib/lib.es2015.collection.d.ts:36

___

### has

▸ **has**(`key`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `number` |

#### Returns

`boolean`

boolean indicating whether an element with the specified key exists or not.

#### Inherited from

Map.has

#### Defined in

node_modules/typescript/lib/lib.es2015.collection.d.ts:40

___

### keys

▸ **keys**(): `IterableIterator`<`number`\>

Returns an iterable of keys in the map

#### Returns

`IterableIterator`<`number`\>

#### Inherited from

Map.keys

#### Defined in

node_modules/typescript/lib/lib.es2015.iterable.d.ts:131

___

### set

▸ **set**(`key`, `value`): [`LuminanceCharacterCodeMap`](../wiki/LuminanceCharacterCodeMap)

Adds a new element with a specified key and value to the Map. If an element with the same key already exists, the element will be updated.

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `number` |
| `value` | `number` |

#### Returns

[`LuminanceCharacterCodeMap`](../wiki/LuminanceCharacterCodeMap)

#### Inherited from

Map.set

#### Defined in

node_modules/typescript/lib/lib.es2015.collection.d.ts:44

___

### values

▸ **values**(): `IterableIterator`<`number`\>

Returns an iterable of values in the map

#### Returns

`IterableIterator`<`number`\>

#### Inherited from

Map.values

#### Defined in

node_modules/typescript/lib/lib.es2015.iterable.d.ts:136
