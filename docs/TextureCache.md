# Class: TextureCache

## Hierarchy

- `Map`<`number`, `ImageData`\>

  ↳ **`TextureCache`**

## Table of contents

### Constructors

- [constructor](../wiki/TextureCache#constructor)

### Properties

- [[toStringTag]](../wiki/TextureCache#%5Btostringtag%5D)
- [size](../wiki/TextureCache#size)
- [[species]](../wiki/TextureCache#%5Bspecies%5D)

### Methods

- [[iterator]](../wiki/TextureCache#%5Biterator%5D)
- [clear](../wiki/TextureCache#clear)
- [delete](../wiki/TextureCache#delete)
- [entries](../wiki/TextureCache#entries)
- [forEach](../wiki/TextureCache#foreach)
- [get](../wiki/TextureCache#get)
- [has](../wiki/TextureCache#has)
- [keys](../wiki/TextureCache#keys)
- [set](../wiki/TextureCache#set)
- [values](../wiki/TextureCache#values)

## Constructors

### constructor

• **new TextureCache**(`luminanceCodeMap`, `fontSize`, `fontFamily`, `pixelRatio`, `backgroundColor`, `debug?`)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `luminanceCodeMap` | [`LuminanceCharacterCodeMap`](../wiki/LuminanceCharacterCodeMap) | `undefined` |
| `fontSize` | `number` | `undefined` |
| `fontFamily` | `string` | `undefined` |
| `pixelRatio` | `number` | `undefined` |
| `backgroundColor` | `string` | `undefined` |
| `debug` | `boolean` | `false` |

#### Overrides

Map&lt;number, ImageData\&gt;.constructor

#### Defined in

[utils.mts:153](https://github.com/sister-software/asciify/blob/9750ae3/utils.mts#L153)

## Properties

### [toStringTag]

• `Readonly` **[toStringTag]**: `string`

#### Inherited from

Map.\_\_@toStringTag@1577

#### Defined in

node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:135

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

▸ **[iterator]**(): `IterableIterator`<[`number`, `ImageData`]\>

Returns an iterable of entries in the map.

#### Returns

`IterableIterator`<[`number`, `ImageData`]\>

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

▸ **entries**(): `IterableIterator`<[`number`, `ImageData`]\>

Returns an iterable of key, value pairs for every entry in the map.

#### Returns

`IterableIterator`<[`number`, `ImageData`]\>

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
| `callbackfn` | (`value`: `ImageData`, `key`: `number`, `map`: `Map`<`number`, `ImageData`\>) => `void` |
| `thisArg?` | `any` |

#### Returns

`void`

#### Inherited from

Map.forEach

#### Defined in

node_modules/typescript/lib/lib.es2015.collection.d.ts:31

___

### get

▸ **get**(`key`): `undefined` \| `ImageData`

Returns a specified element from the Map object. If the value that is associated to the provided key is an object, then you will get a reference to that object and any change made to that object will effectively modify it inside the Map.

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `number` |

#### Returns

`undefined` \| `ImageData`

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

▸ **set**(`key`, `value`): [`TextureCache`](../wiki/TextureCache)

Adds a new element with a specified key and value to the Map. If an element with the same key already exists, the element will be updated.

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `number` |
| `value` | `ImageData` |

#### Returns

[`TextureCache`](../wiki/TextureCache)

#### Inherited from

Map.set

#### Defined in

node_modules/typescript/lib/lib.es2015.collection.d.ts:44

___

### values

▸ **values**(): `IterableIterator`<`ImageData`\>

Returns an iterable of values in the map

#### Returns

`IterableIterator`<`ImageData`\>

#### Inherited from

Map.values

#### Defined in

node_modules/typescript/lib/lib.es2015.iterable.d.ts:136
