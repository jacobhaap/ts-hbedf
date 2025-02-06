import { shuffle } from "./utils/shuffle.ts";
import { createHash } from "node:crypto";
import { Buffer } from "node:buffer";

/**
 * Create a pseudorandom seed.
 * A passphrase, identity array, and optional secret are used to derive the seed using two shuffle iterations
 * using {@link shuffle}. The first iteration shuffles based on the passphrase. A checksum is derived for use
 * in the second shuffle from a `SHA256` hash of the first shuffle result, and the checksum is then used in
 * the second shuffle. The first iteration shuffles the order of the array, and the second iteration targets
 * every character in the string resulting from the first iteration. The seed is derived by appending the checksum
 * to the result of the second iteration and returning it as a Buffer.
 */
export function createSeed(passphrase: string, rekeying: boolean, identity: string[], secret: string | null): Buffer {
    // Creates the input array, inserting the secret when provided (not 'null')
    let input: string[];
    if (secret) input = [...identity, secret];
    else input = [...identity];

    // First shuffle iteration, using the passphrase
    const firstShuffle = shuffle(passphrase, rekeying, input);

    // Take a SHA-256 hash of the result from the first shuffle with a hexadecimal digest
    const hash = createHash('sha256').update(firstShuffle).digest('hex');
    // Convert the hexadecimal hash value to decimal
    const decimal = BigInt('0x' + hash).toString();
    // Extract the first 6 digits from the decimal value as a checksum
    const checksum = decimal.substring(0, 6);

    // Create an array of all characters from the firstShuffle string
    const charArray = firstShuffle.split('');
    // Second shuffle iteration all characters in the charArray based on the checksum
    // Append checksum to resulting string to derive seed
    const seed = shuffle(checksum, rekeying, charArray) + checksum;
    // Return the seed as a Buffer
    return Buffer.from(seed);
}
