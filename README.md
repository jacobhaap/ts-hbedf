# TypeScript HBEDF
This is a reference implementation of the **Human-Based Entropy Derivation Function** (HBEDF), based on the specification titled *"Deterministic Method of Entropy Derivation from Human Identity and Secrets."*

Natively in **TypeScript**, with **ESM** and **CommonJS** compatibility. To get started, install the library:
```bash
# Deno
deno add jsr:@iacobus/hbedf

# Node.js
npm install @iacobus/hbedf
```

# Usage
TypeScript/ESM import:
```ts
import { hbedf } from "@iacobus/hbedf";
```

CommonJS require:
```js
const { hbedf } = require("@iacobus/hbedf");
```
For demonstration purposes, functions and their parameters with types will be displayed in TypeScript, and the example use of the library will be displayed in ESM.

## hbedf
A pseudorandom seed can be derived from Human Identity & Secrets using the `hbedf` function. This derives the seed from a provided **Passphrase**, **Identity** array, and optional **Secret**, based on the process described in the [*"From Identity to Seed"*](https://gist.github.com/jacobhaap/e8305533628be06fc09754d41a17ee5b#from-identity-to-seed) section of the HBEDF specification.
```ts
hbedf(passphrase: string, rekeying: boolean, identity: string[], secret: string | null): Buffer {};
```
This requires a `passphrase`, `identity`, and optional `secret` parameter, corresponding to their namesakes. The `rekeying` parameter is used to enable to disable rekeying as described in the [*"Fisher-Yates Shuffle Algorithm"*](https://gist.github.com/jacobhaap/e8305533628be06fc09754d41a17ee5b#fisher-yates-shuffle-algorithm) section of the specification, enabling when *true* and disabling when *false*. The `hbedf` function returns the pseudorandom seed as a **Buffer**.
```js
import { hbedf } from "@iacobus/hbedf";

// 6-Digit PIN as Passphrase
const passphrase = "123456";

// Identity Array
const identity = [
    "L01X00T47",        // Document Number
    "MUSTERMANN",       // Name
    "ERIKA",            // Given Name
    "12081983",         // Date of Birth
    "DEUTSCH",          // Nationality
    "BERLIN",           // Birthplace
    "GREEN",            // Eye Color
    "160",              // Height
    "HEIDESTRASSE17"    // Address
];

// SHA-256 Hash of Secret
const secret = "1e7f7c26deaad3aea0d7aa5cf450efdd314ab4889595ed1844b4da23a855ee7c";

// Derive seed with 'hbedf'
const seed = hbedf(passphrase, false, identity, secret).toString('base64');
console.log(seed);

```

In this example, a seed is derived from a 6-digit PIN, following the recommendation to use a "*4- to 12-digit numerical PIN"* as the Passphrase, along with an Identity array for a sample identity, and a Secret supplied as a SHA-256 hash of the secret. Rekeying has been disabled, and the derived seed is returned as a base64 string from the Buffer.
```
YTJiRVJkNjFkNWVFTUxTOGVkNDcwN2FFZVRmMTFYN0FjODVUMmVUODBTVUIyYzE4RUVhNDVJSFI0RDRhQWEwTkExZlI1SWQxZGUwRTU1RThFVDNSYlNEMWNHTWE4M2RlNDlTTjA0Nzc5TjRFTDc5UklhYTBkYVUwQzNINjNmS04xZVMxNjEyNjkyMzI1
```

## HMAC Random Number Generator
Pseudorandom numbers are generated from an **HMAC-SHA256**, based on the process described in the [*"HMAC Pseudorandom Number Generation"*](https://gist.github.com/jacobhaap/e8305533628be06fc09754d41a17ee5b#hmac-pseudorandom-number-generation) section of the specification. A floating-point number in the range in the range **[0, 1)** derived via seeded random number generation can be obtained with the `hmacRng` function.
```ts
hmacRng(secret: string | Buffer, data: string, counter: number | null): number {};
```
This requires a `secret` parameter, which is either used to derive a cryptographic key with **PBKDF2** when its type is a *string*, or is itself used as a key when its type is a *Buffer*. The `data` and optional `counter` parameters are used as the data to update the HMAC with. The random number is returned as a **number**.
```js
import { hmacRng } from "@iacobus/hbedf";

// Sample secret, supplied as a string to derive key
const secret = "Goodbye Blue Sky";

// Sample data
const data = "476F6F7365207361797320486F6E6B21";

// Get random number with 'hmacRng'
const rng = hmacRng(secret, data, null);
console.log(rng);

```

In this example, a pseudorandom floating-point number is derived from an HMAC using a secret as a string (causing a key to be derived internally) and updated with a hexadecimal string. The returned number is based on the first 12 characters of the hexadecmial digest of the HMAC.
```
0.9859458969802724
```

## Shuffle Algorithm Implementation
The implementation of the **Fisher-Yates Shuffle Algorithm**, based on the description provided in the [*"Fisher-Yates Shuffle Algorithm"*](https://gist.github.com/jacobhaap/e8305533628be06fc09754d41a17ee5b#fisher-yates-shuffle-algorithm) section of the specification, shuffles arrays based on random number generation provided by the **HMAC Random Number Generator**, using the `fyShuffle` function.
```ts
fyShuffle(secret: string, rekeying: boolean, input: string[]): string {};
```
This requires a `secret` parameter, which is the secret used for the random number generation, along with a `rekeying` parameter to enable (*true*) or disable (*false*) the use of rekeying as described in the specification, and an `input` parameter as the array to be shuffled. The shuffled array is returned as an **NFKD**-normalized **string**.
```js
import { fyShuffle } from "@iacobus/hbedf";

// Sample secret, supplied as a string to derive key
const secret = "Black Mirror";

// Create an array from a string
const str = "TheirNamesAreNeverSpoken";
const input = str.split('');

// Shuffle with 'fyShuffle'
const shuffled = fyShuffle(secret, true, input);
console.log(shuffled);

```

In this example, an array is created from a string, then is shuffled based on the provided `secret`, with `rekeying` enabled. The shuffled array is joined into a string, and returned with NFKD normalization applied.
```
enNesoepivrSTerNkrehameA
```

## Checksum Calculation
A **32-bit decimal checksum** can be calculated based on the method outlined in the [*"Checksum"*](https://gist.github.com/jacobhaap/e8305533628be06fc09754d41a17ee5b#checksum) section of the specification using the `checksum` function.
```ts
hbedf.checksum(data:  string  |  Buffer): Buffer {};
```
This requires a `data` parameter, which expects the data for which a checksum is being calculated, provided as a `utf8` encoded *string* or a *Buffer*. The calculated checksum is returned as a **Buffer** of the 10-digit decimal string with padding.
```js
import { checksum } from "@iacobus/hbedf";

// Sample data to calculate checksum
const data = "Unmake the Wild Light";

// Calculate checksum with 'checksum'
const csum = checksum(data).toString('utf8');
console.log(csum);

```
In this example, a checksum is calculated from data provided as a `utf8` encoded string. The calculated checksum is returned as a Buffer, which is encoded as a string before logging.
```
1859985276
```

## Verify Checksum
The **integrity of data** with a **32-bit decimal checksum** appended can be verified using the `verify` function, assuming the checksum of the data was calculated based on the process described in the *"Checksum Calculation"* section above or the [*"Checksum"*](https://gist.github.com/jacobhaap/e8305533628be06fc09754d41a17ee5b#checksum) section of the specification.
```ts
verify(data:  string  |  Buffer):  boolean {};
```
This requires a `data` parameter, which expects the data with a checksum appended, provided as a `utf8` encoded *string* or a *Buffer*. The resulting verification of the checksum/data integrity is returned as a **boolean** value of *true* when the verification is successful, or *false* when it fails.
```js
import { verify } from "@iacobus/hbedf";

// Sample data with a checksum
const data = "556E6D616B65207468652057696C64204C6967687431383539393835323736";

// Create a Buffer from the data, as the string is not 'utf8' encoded
const dataBuffer = Buffer.from(data, 'hex');

// Verifies the checksum with 'verify'
const verified = verify(dataBuffer);
console.log(verified);

```
In this example, the data with a checksum is provided as a hexadecimal string, which is first converted to a Buffer as the string is not `utf8` encoded. Verification is then attempted of the `dataBuffer`, logging the result.
```
true
```
