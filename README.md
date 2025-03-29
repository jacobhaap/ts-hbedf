# TypeScript HBEDF
This is a reference implementation of the **Human-Based Entropy Derivation Function** (HBEDF), based on the specification titled *"Deterministic Method of Entropy Derivation from Human Identity and Secrets."*

Natively in **TypeScript**, with **ESM** and **CommonJS** compatibility. To get started, install the library:
```bash
# Deno
deno add jsr:@iacobus/hbedf

# Node.js
npm install @iacobus/hbedf
```

# HBEDF
TypeScript/ESM import:
```ts
import { hbedf } from "@iacobus/hbedf";
```

CommonJS require:
```js
const { hbedf } = require("@iacobus/hbedf");
```
A pseudorandom seed can be derived from Human Identity & Secrets using the `hbedf` function. This derives the seed from a provided **Passphrase**, **Identity** array, and optional **Secret**, based on the process described in the [*"Deriving a Seed"*](https://gist.github.com/jacobhaap/e8305533628be06fc09754d41a17ee5b#deriving-a-seed) section of the specification.

The *HBEDF* function has four input parameters:
```js
async function hbedf(passphrase, identity, secret, opts) {};
```
Where:
 - ***passphrase*** is a passphrase or key (*e.g., password, numerical PIN, cryptographic key*).
 - ***identity*** is an array of an *Identity*.
 - ***secret*** is an optional string of a *Secret*.
 - ***opts*** contains the options for output transformation and key derivation with the *scrypt* KDF.
	 - ***a*** is the hashing algorithm applied during output transformation (*e.g., blake2b*).
	 - ***dkLen*** is an optional output length when ***a*** is an *Extendable-output function (XOF)*.
	 - ***N*** is the *scrypt* work factor to scale memory and CPU usage.[^1]
	 - ***r*** determines the block size (*BlockMix*).
	 - ***p*** is for parallelization (*not supported in JavaScript*).
	 - ***maxmem*** is the memory cap to prevent DoS.

[^1]: The ***N***, ***r***, ***p***, and ***maxmem*** options proxy to the options of the same name required in the [@noble/hashes](https://github.com/paulmillr/noble-hashes?tab=readme-ov-file#scrypt) implementation of the *scrypt* key derivation function.

The ***passphrase*** parameter is expected as a *string* or *Uint8Array*, the ***identity*** parameter is expected as an *array (string[])*, the ***secret*** parameter is expected as a *string*, and the ***opts*** parameter is expected as a *SeedOpts* object. The *HBEDF* function is asynchronous, and returns a Promise that resolves to a *Uint8Array*.

*SeedOpts Type[^2]:*
```ts
type SeedOpts = {
    a: Algorithm;
    dkLen?: number;
    N: number;
    r: number;
    p: number;
    maxmem?: number;
}
```

[^2]: In the *SeedOpts* type, the ***a*** and ***dkLen*** options are used to configure the output transformation. The *Algorithm* type expected for ***a*** must be the name of a hashing algorithm supported by [@noble/hashes](https://github.com/paulmillr/noble-hashes), specifically from the *sha2*, *sha3*, *sha3-addons*, *ripemd160*, *blake1*, *blake2b*, *blake2s*, and *blake3* exports. The name of the hashing algorithm must be provided as a string. The ***N***, ***r***, ***p***, and ***maxmem*** options proxy to the options of the same name required in the [@noble/hashes](https://github.com/paulmillr/noble-hashes?tab=readme-ov-file#scrypt) implementation of the *scrypt* key derivation function.

*Example use, deriving a seed from a Passphrase and Identity:*
```ts
import { type SeedOpts, hbedf } from "@iacobus/hbedf";

const passphrase: string = "123456";
const identity: string[] = ["MUSTERMANN", "ERIKA", "L01X00T47", "12081983"];
const opts: SeedOpts = { a: "blake2s", N: 2 ** 8, r: 8, p: 1, dkLen: 16 };

const seed = await hbedf(passphrase, identity, null, opts);

/*
Uint8Array(32) [
  102, 189, 153, 140,  18,  33, 124,
  159, 100, 173,  86, 217, 167,  19,
  172,  38, 222, 158, 231, 192,  44,
   95,  56,  59, 147, 118, 122,  40,
  152, 144, 210, 132
]
*/
```

# Utilities
The HBEDF utility functions are available under the **@iacobus/hbedf/utils** namespace. This includes functionality for conversion between Uint8Arrays and hexadecimal strings, random number generation, array shuffling, checksum calculation and verification, and output transformation. These utility functions may be imported individually, or as part of a `utils` object.

TypeScript/ESM import:
```ts
import { utils } from "@iacobus/hbedf/utils";
```

CommonJS require:
```js
const { utils } = require("@iacobus/hbedf/utils");
```

## Conversion Utilities
Two functions are included for the conversion between **Uint8Arrays** and **Hexadecimal Strings**. The `toHex` function accepts a *Uint8Array* and returns a hex-encoded *string*, and the `toBytes` function accepts a hex-encoded *string* and returns a *Uint8Array*.

*Convert from a Uint8Array to a hex string:*
```ts
import { toHex } from "@iacobus/hbedf/utils";

const bytes: Uint8Array = Uint8Array.from([11, 19, 13, 17]);
const hex = toHex(bytes); // 0b130d11
```

*Convert from a hex string to a Uint8Array:*
```ts
import { toBytes } from "@iacobus/hbedf/utils";

const hex: string = "0b130d11";
const bytes = toBytes(hex); // Uint8Array(4) [ 11, 19, 13, 17 ]
```

## Random Number Generation
Pseudorandom numbers are generated from an **HMAC-SHA256**, based on the process described in the [*"Random Number Generation"*](https://gist.github.com/jacobhaap/e8305533628be06fc09754d41a17ee5b#random-number-generation) section of the specification. A floating-point number in the range **[0, 1)** derived via seeded random number generation can be obtained with the `hmacRng` function.

The *hmacRng* function has three input parameters:
```js
function hmacRng(key, msg, c?) {};
```
Where:
 - ***key*** is a cryptographic key.
 - ***msg*** is a message for the *MAC*.
 - ***c*** is an optional counter value for the *MAC*.

The ***key*** parameter is expected as a *Uint8Array*, the ***msg*** parameter is expected as a *Uint8Array*, and the optional ***c*** parameter is expected as a *number*. The *hmacRng* function is synchronous, and returns a *number*.

*Example use, without a counter:*
```ts
import { hmacRng } from "@iacobus/hbedf/utils";

const key: Uint8Array = Uint8Array.from([1, 2, 3, 4]);
const msg: Uint8Array = Uint8Array.from([5, 6, 7, 8]);

const rng = hmacRng(key, msg); // 0.8780841176487075
```

## Array Shuffling
Arrays are shuffled based on the implementation of the shuffle algorithm as described in the [*"Array Shuffling"*](https://gist.github.com/jacobhaap/e8305533628be06fc09754d41a17ee5b#array-shuffling) section of the specification. An array can be shuffled using the `fyShuffle` function.

The *fyShuffle* function has three input parameters:
```js
async function fyShuffle(secret, input, opts) {};
```
Where:
 - ***secret*** is the password used in the *scrypt* KDF.
 - ***input*** is the array to be shuffled.
 - ***opts*** are the options for the *scrypt* KDF.

The ***secret*** parameter is expected as a *Uint8Array*, the ***input*** parameter is expected as an *array (string[])*, and the ***opts*** parameter is expected as an *ScryptOpts* object (*see [@noble/hashes](https://github.com/paulmillr/noble-hashes?tab=readme-ov-file#scrypt)*). The *fyShuffle* function is asynchronous, and returns a Promise that resolves to a *string*.

*Example use:*
```ts
import { type ScryptOpts, fyShuffle } from "@iacobus/hbedf/utils";

const secret: Uint8Array = Uint8Array.from([1, 2, 3, 4]);
const input: string[] = "0123456789".split("");
const opts: ScryptOpts = { N: 2 ** 8, r: 8, p: 1, dkLen: 32 };

const shuffle = await fyShuffle(secret, input, opts); // 9740286315
```

## Checksums
Checksums are calculated based on the process described in the [*"Checksum"*](https://gist.github.com/jacobhaap/e8305533628be06fc09754d41a17ee5b#checksum) section of the specification. A **16 byte checksum** can be calculated using the `checksum` function.

The *checksum* function has one input parameter:
```js
function checksum(msg) {};
```
Where:
 - ***msg*** is the message for which a checksum is calculated.

The ***msg*** parameter is expected as a *Uint8Array*. The *checksum* function is synchronous, and returns the calculated checksum as a *Uint8Array*.

*Example use:*
```ts
import { toBytes, toHex, checksum } from "@iacobus/hbedf/utils";

const hexStr: string = "940d878d35ba771332fe98efd3bd51a2";
const msg: Uint8Array = toBytes(hexStr);

const csum = toHex(checksum(msg)); // 93bb7cdab5363686efa39a2f10566c70
```

---

A message containing an appended checksum can be verified using the `verify` function, which has one input parameter:
```js
function verify(msg) {};
```
Where:
 - ***msg*** is the message with an appended checksum to be verified.

The ***msg*** parameter is expected as a Uint8Array. The *verify* function is synchronous, and returns the verification result as a *boolean* value.

*Example use:*
```ts
import { toBytes, verify } from "@iacobus/hbedf/utils";

const hexStr: string = "940d878d35ba771332fe98efd3bd51a293bb7cdab5363686efa39a2f10566c70";
const msg: Uint8Array = toBytes(hexStr);

const verified = verify(msg); // true
```

## Output Transformation
Output transformation via hashing is applied based on the process described in the [*"Output Transformation"*](https://gist.github.com/jacobhaap/e8305533628be06fc09754d41a17ee5b#output-transformation) section of the specification. A message can be transformed using the `transform` function.

The *transform* function has three input parameters:
```js
async function transform(a, msg, dkLen?)
```
Where:
 - ***a*** is the name of a hashing algorithm.
 - ***msg*** is the message to be transformed.
 - ***dkLen*** is an optional output length when ***a*** is an *Extendable-output function (XOF)*.

The ***a*** parameter is expected as an *Algorithm[^3]*, the ***msg*** parameter is expected as a *Uint8Array*, and the optional ***dkLen*** parameter is expected as a *number*. The *transform* function is asynchronous, and returns a Promise that resolves to a *Uint8Array*.

[^3]: The *Algorithm* type is a type that allows names of hashing algorithms supported by [@noble/hashes](https://github.com/paulmillr/noble-hashes) to be provided as strings. Specifically, hashing algorithms from the following modules of the library are supported: *sha2*, *sha3*, *sha3-addons*, *ripemd160*, *blake1*, *blake2b*, *blake2s*, and *blake3*.

*Example use:*
```ts
import { type Algorithm, transform } from "@iacobus/hbedf/utils";

const a: Algorithm = "blake2b";
const msg: Uint8Array = Uint8Array.from([0, 9, 8, 7]);
const dkLen: number = 48;

const tf = await transform(a, msg, dkLen);

/*
Uint8Array(48) [
    7, 210,  46, 141,  78, 123,  45, 151,   0,
   98, 157, 152,  86,  23, 194, 190, 103, 227,
  170,  66, 192,  68, 212, 189, 226,  35, 194,
  250, 103, 235,  53,  48, 230, 228, 239,  22,
  163, 115, 218,  69, 116, 223,  53, 127, 215,
   94,  28, 142
]
*/
```
