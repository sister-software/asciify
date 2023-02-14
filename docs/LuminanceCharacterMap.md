# Class: LuminanceCharacterMap

Given an array of 255 or less ASCII characters representing the brightness of each pixel,
returns something like a radix-sorted array of 255 characters that are evenly spaced.

This helps us avoid expensive operations like Math.floor() when rendering the ASCII art.

## Hierarchy

- `Map`<`number`, `string`\>

  ↳ **`LuminanceCharacterMap`**

## Table of contents

### Constructors

- [constructor](../wiki/LuminanceCharacterMap#constructor)

### Properties

- [[toStringTag]](../wiki/LuminanceCharacterMap#%5Btostringtag%5D)
- [characterSet](../wiki/LuminanceCharacterMap#characterset)
- [size](../wiki/LuminanceCharacterMap#size)
- [[species]](../wiki/LuminanceCharacterMap#%5Bspecies%5D)

### Methods

- [[iterator]](../wiki/LuminanceCharacterMap#%5Biterator%5D)
- [clear](../wiki/LuminanceCharacterMap#clear)
- [delete](../wiki/LuminanceCharacterMap#delete)
- [entries](../wiki/LuminanceCharacterMap#entries)
- [forEach](../wiki/LuminanceCharacterMap#foreach)
- [get](../wiki/LuminanceCharacterMap#get)
- [has](../wiki/LuminanceCharacterMap#has)
- [keys](../wiki/LuminanceCharacterMap#keys)
- [set](../wiki/LuminanceCharacterMap#set)
- [values](../wiki/LuminanceCharacterMap#values)

## Constructors

### constructor

• **new LuminanceCharacterMap**(`characterSet`, `contrastRatio`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `characterSet` | `string` \| `string`[] |
| `contrastRatio` | `number` |

#### Overrides

Map&lt;
  /** The luminance of the pixel. 0 to 255. */
  number,
  /** The character code of the character to render. */
  string
\&gt;.constructor

#### Defined in

[utils/LuminanceCharacterMap.mts:16](https://github.com/sister-software/asciify/blob/f11c4e8/utils/LuminanceCharacterMap.mts#L16)

## Properties

### [toStringTag]

• `Readonly` **[toStringTag]**: `string`

#### Inherited from

Map.\_\_@toStringTag@1577

#### Defined in

node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:135

___

### characterSet

• `Readonly` **characterSet**: `string` \| `string`[]

#### Defined in

[utils/LuminanceCharacterMap.mts:16](https://github.com/sister-software/asciify/blob/f11c4e8/utils/LuminanceCharacterMap.mts#L16)

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

Map.\_\_@species@1733

#### Defined in

node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:317

## Methods

### [iterator]

▸ **[iterator]**(): `IterableIterator`<[`number`, `string`]\>

Returns an iterable of entries in the map.

#### Returns

`IterableIterator`<[`number`, `string`]\>

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

▸ **entries**(): `IterableIterator`<[`number`, `string`]\>

Returns an iterable of key, value pairs for every entry in the map.

#### Returns

`IterableIterator`<[`number`, `string`]\>

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
| `callbackfn` | (`value`: `string`, `key`: `number`, `map`: `Map`<`number`, `string`\>) => `void` |
| `thisArg?` | `any` |

#### Returns

`void`

#### Inherited from

Map.forEach

#### Defined in

node_modules/typescript/lib/lib.es2015.collection.d.ts:31

___

### get

▸ **get**(`key`): `undefined` \| `string`

Returns a specified element from the Map object. If the value that is associated to the provided key is an object, then you will get a reference to that object and any change made to that object will effectively modify it inside the Map.

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `number` |

#### Returns

`undefined` \| `string`

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

▸ **set**(`key`, `value`): [`LuminanceCharacterMap`](../wiki/LuminanceCharacterMap)

Adds a new element with a specified key and value to the Map. If an element with the same key already exists, the element will be updated.

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `number` |
| `value` | `string` |

#### Returns

[`LuminanceCharacterMap`](../wiki/LuminanceCharacterMap)

#### Inherited from

Map.set

#### Defined in

node_modules/typescript/lib/lib.es2015.collection.d.ts:44

___

### values

▸ **values**(): `IterableIterator`<`string`\>

Returns an iterable of values in the map

#### Returns

`IterableIterator`<`string`\>

#### Inherited from

Map.values

#### Defined in

node_modules/typescript/lib/lib.es2015.iterable.d.ts:136
