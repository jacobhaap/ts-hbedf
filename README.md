# TypeScript HBEDF
TypeScript HBEDF provides functionality for generating deterministic pseudorandom sequences of bytes from human-derived values. A derived seed can be generated from an array of biographic material, and a secret, across four phases: Key, Extract, Shuffle, an Expand. Natively in **TypeScript**, with **ESM** and **CommonJS** compatibility. To get started, install the library:
```bash
# Deno
deno add jsr:@iacobus/hbedf

# Node.js
npm install @iacobus/hbedf
```
This is a reference implementation of the **Human-Based Entropy Derivation Function** (HBEDF), from the specification titled *["Deterministic Method of Entropy Derivation from Human Identity and Secrets"](https://gist.github.com/jacobhaap/e8305533628be06fc09754d41a17ee5b)*. The cryptographic keys used across internal derivation phases are [Hierarchical Deterministic Symmetric Keys](https://github.com/jacobhaap/ts-hdsk).

# Derive a Seed
TypeScript/ESM import:
```ts
import { hbedf } from "@iacobus/hbedf";
```

CommonJS require:
```js
const { hbedf } = require("@iacobus/hbedf");
```
A derived seed can be generated using the `hbedf` function. A synchronous version of this function also exists, as the `hbedfSync` function. For demonstration purposes, the asynchronous version will be used.

## HBEDF Function
The *HBEDF* function has four input parameters:
```js
async function hbedf(h, ibm, secret, opts) {};
```
Where:
 - ***h*** is a hash function (*e.g. sha256, sha512*).
 - ***ibm*** is an array of initial biographic information (*e.g. name, date of birth, document number*).
 - ***secret*** is the secret information (*e.g. PIN, passphrase*) used to generate the key used across internal derivation phases.
 - ***opts*** are the options for configuring seed derivation.
	 - ***path*** is the derivation path used to generate the internal HD key.
	 - ***schema*** (optional) is the derivation path schema (*uses a default schema when undefined*).
	 - ***c*** is an iterations count, for the number of HMAC iterations applied to ***ibm*** for strengthening.
	 - ***mem*** is the target memory cost in MiB applied cumulatively across *Scrypt* invocations during array shuffling.
	 - ***dsLen*** (optional) is the desired byte length of the derived seed (*default 32*).

The ***h*** parameter is expected as any compatible hash function ([noble-hashes](https://github.com/paulmillr/noble-hashes) *CHash*). The ***ibm*** parameter is expected as an array of *Uint8Arrays*. The ***secret*** parameter is expected as a *Uint8Array*. The ***opts*** parameter is expected as an *HbedfOpts* object. The *HBEDF* function is asynchronous, and returns a Promise that resolves to a *Uint8Array*. The *hbedfSync* function is synchronous, and returns a *Uint8Array*.

## HbedfOpts Type
The `HbedfOpts` type is an object containing the derivation path, optional derivation path schema, iterations count, target memory cost, and optional output length.
```ts
type HbedfOpts = {
	path: string;
	schema?: string;
	c: number;
	mem: number;
	dsLen?: number;
};
```

# Example Use
```ts
import { hbedf, type HbedfOpts } from "@iacobus/hbedf";
import { sha256 } from "@noble/hashes/sha2";
import { hexToBytes, utf8ToBytes } from "@noble/hashes/utils";

// Use sha256
const h = sha256;

// Encode the biographic material
const bio = ["MUSTERMANN", "ERIKA", "L01X00T47", "12081983"];
const ibm: Uint8Array[] = bio.map((b) => utf8ToBytes(b));

// Encode a secret from a hex string
const secret = hexToBytes("54686520696D6D6F7274616C20736E61696C20697320626568696E6420796F75");

// Generate a derived seed
const opts: HbedfOpts = { path: "m/42/0/1/0", c: 10000, mem: 128, dsLen: 64 };
const ds = await hbedf(h, ibm, secret, opts);

/*
Uint8Array(64) [
  198,  79, 202,  89,  94,  30, 208,  96,  11,  39, 108,
  154, 173, 127,  12,  13, 150, 116, 218, 252, 230, 100,
   33, 207, 134, 245, 133, 133,  83,  28, 105, 188, 223,
   20, 139, 117,  61,   9, 208, 229, 116,  94,  37, 112,
  179, 201,  29, 239, 140, 231, 108, 210, 254,   6, 195,
  182, 115, 138, 176, 165, 222, 155, 192,   9
]
*/
```
