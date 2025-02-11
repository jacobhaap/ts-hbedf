import { shuffle } from "./utils/shuffle.ts";
import { calculateChecksum, verifyChecksum } from "./utils/checksum.ts";
import { Buffer } from "node:buffer";

/**
 * Create a pseudorandom seed.
 * A passphrase, identity array, and optional secret are used to derive the seed using two shuffle iterations
 * using {@link shuffle}. The first iteration shuffles based on the passphrase. The second iteration shuffles
 * based on a checksum of the first iteration calculated with {@link calculateChecksum}. The first iteration
 * shuffles the order of the array, and the second iteration targets every character in the string resulting from
 * the first iteration. The seed is derived from the results of the second iteration, with a checksum calculated
 * and appended for data integrity, returning the seed as a Buffer.
 */
export function createSeed(passphrase: string, rekeying: boolean, identity: string[], secret: string | null): Buffer {
    // Creates the input array, inserting the secret when provided (not 'null')
    let input: string[];
    if (secret) input = [...identity, secret];
    else input = [...identity];

    // First shuffle iteration, using the passphrase
    const firstShuffle = shuffle(passphrase, rekeying, input);

    // Calculate a 32-bit decimal checksum of the firstShuffle
    const fsChecksum = calculateChecksum(firstShuffle).toString('utf8');

    // Create an array of all characters from the firstShuffle string
    const charArray = firstShuffle.split('');

    // Second shuffle iteration all characters in the charArray based on the fsChecksum
    const secondShuffle = shuffle(fsChecksum, rekeying, charArray);

    // Calculate a 32-bit decimal checksum of the secondShuffle
    const checksum = calculateChecksum(secondShuffle).toString('utf8');
    // Append the checksum to the secondShuffle to construct seed
    const seed = secondShuffle + checksum;

    // Verify checksum to establish seed integrity
    // Return the seed as a Buffer if verification passes
    const verify = verifyChecksum(seed);
    if (verify) return Buffer.from(seed);
    else throw new Error(`Unable to verify seed integrity.`)
}
