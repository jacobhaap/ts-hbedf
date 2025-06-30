/**
 * @fileoverview Test script for the exports of the @iacobus/hbedf entry point.
 * Completes tests for hbedf and hbedfSync with an array of typed vectors.
 * @author Jacob V. B. Haap <iacobus.xyz>
 * @license MIT
 */

import type { CHash } from "npm:@noble/hashes@1.8.0/utils";
import { hbedf, type HbedfOpts, hbedfSync } from "../src/mod.ts";
import { bytesToHex } from "npm:@noble/hashes@1.8.0/utils";
import { assert } from "jsr:@std/assert@1.0.13";
import { sha256, sha512 } from "npm:@noble/hashes@1.8.0/sha2";

/** Vector is an object for a test vector. */
type Vector = {
	h: CHash;
	ibm: string[];
	secret: string;
	opts: HbedfOpts;
	ds: string;
};

/** vectors are HBEDF test vectors. */
const vectors: Vector[] = [
	{
		"h": sha256,
		"ibm": ["L01X00T47", "MUSTERMANN", "ERIKA", "12081983", "DEUTSCH", "BERLIN"],
		"secret": "31e084bdf1f0a8483fda7df75d74b073",
		"opts": {
			"path": "m/42/0/1/0",
			"schema": "m / application: any / purpose: any / context: any / index: num",
			"c": 1000,
			"mem": 32,
			"dsLen": 64
		},
		"ds":
			"9e94b231f2138ed6b56b5acf77446687eac52e9b8490114af2202341a8540d1275d7597f67e498d406434bfb29dbc36739b0b1ae316aba96bc6768e9371a71cb"
	},
	{
		"h": sha512,
		"ibm": ["S1A00A00", "SCHWEIZER SAMPLE", "HELVETICA", "01081995", "CHE", "BERN"],
		"secret": "d8ea5919562f4b4613a9caf6493636b9",
		"opts": {
			"path": "m/42/0/1/0",
			"schema": "m / application: any / purpose: any / context: any / index: num",
			"c": 2000,
			"mem": 16,
			"dsLen": 64
		},
		"ds":
			"5d1f9c56a079acff8f3b06b470bdec24fc0eca79e13ae15bc4c081884154155d4ba627250600316022d791cc7f7e95523dc4cffd1d46a3840e691d1ad075f1a4"
	},
	{
		"h": sha512,
		"ibm": ["X4RTBPFW4", "MARTIN", "MAELYS-GAELLE MARIE", "13071990", "FRA", "PARIS"],
		"secret": "b7948d34b8ebf5eb8b0a1ff714227313",
		"opts": {
			"path": "m/42/0/1/0",
			"schema": "m / application: any / purpose: any / context: any / index: num",
			"c": 500,
			"mem": 64,
			"dsLen": 64
		},
		"ds":
			"1441cbe32463257c59b85cc4ec8158e7b3ff7e36ee7b13af23d844537336577605bd75eb36be7caa80450cbf54e371fe3d364cd1946853f69c5efcd3822f59ac"
	},
	{
		"h": sha256,
		"ibm": ["C03005988", "HAPPY", "TRAVELER", "01011981", "USA", "NEW YORK"],
		"secret": "b71e36cac4b2fef440816bcaf96afc0b",
		"opts": {
			"path": "m/42/0/1/0",
			"schema": "m / application: any / purpose: any / context: any / index: num",
			"c": 1000,
			"mem": 32,
			"dsLen": 64
		},
		"ds":
			"0299763994becb4fd24bc17d5b1249cc8a68d3eb466bace7f7f8337dc79610b4f3598dcdf91a0b3624e0a439e46f3b79471afcea4836425d3d9c0aea40aa113e"
	},
	{
		"h": sha512,
		"ibm": ["RA0123456", "CITIZEN", "JANE", "04051991", "AUS", "CANBERRA"],
		"secret": "b573d0eeede2f3e50e45caaa57d44bfa",
		"opts": {
			"path": "m/42/0/1/0",
			"schema": "m / application: any / purpose: any / context: any / index: num",
			"c": 2000,
			"mem": 16,
			"dsLen": 64
		},
		"ds":
			"ec2311b6e7b24186e463d4ac9ec314fda498ac9fb73705f6b85ccf8116fd9a626d81d1b11f387ae5468dd88b26066de9f7d89750897c0fe5f96f5fa16b8ff772"
	},
	{
		"h": sha512,
		"ibm": ["ZZ1000001", "GAIMU", "SAKURA", "20022000", "JAPAN"],
		"secret": "20723c62ef600c1e28ec4517f069bb36",
		"opts": {
			"path": "m/42/0/1/0",
			"schema": "m / application: any / purpose: any / context: any / index: num",
			"c": 500,
			"mem": 64,
			"dsLen": 64
		},
		"ds":
			"68423d91a82ad0b82873fabe786c9e7ad120fb05b16b70238025a7dde28f660ef1a70cef3e12c158e6436cc3f630d32b19f1d666eca7b13008b2b2d7c3413cb8"
	},
	{
		"h": sha256,
		"ibm": ["M123A4567", "HONG", "GILSOON", "01021987", "REPUBLIC OF KOREA"],
		"secret": "4c252b29e1dae6a57e65e20239307066",
		"opts": {
			"path": "m/42/0/1/0",
			"schema": "m / application: any / purpose: any / context: any / index: num",
			"c": 1000,
			"mem": 32,
			"dsLen": 64
		},
		"ds":
			"df76598391c9a17815363f27eecbb5f12418b9c44fe3926af6efa51b94c35a892b9f51fb208ab2a3455ef8fe313d7a22487c4925938de22cdb29e3e724f349ef"
	},
	{
		"h": sha512,
		"ibm": ["D23145890", "OSULLIVAN", "LAUREN", "04051988", "IRISH"],
		"secret": "d5d841cf6258176636d9411f3d9bb0da",
		"opts": {
			"path": "m/42/0/1/0",
			"schema": "m / application: any / purpose: any / context: any / index: num",
			"c": 2000,
			"mem": 16,
			"dsLen": 64
		},
		"ds":
			"d21e26daf636349de8c2e3a4dfa9d1bc238793f4bcb48cbcf3ff5f544000e2479906961c0b21160f8e864ce96e342860f0b6a024a4e7f04cc9a75753e93b6bb8"
	},
	{
		"h": sha512,
		"ibm": ["A3501291", "SPECIMEN", "THAEOE SPECIMEN", "12121912", "ICELANDIC"],
		"secret": "97819b2e903cc9cf02a49d45d713b088",
		"opts": {
			"path": "m/42/0/1/0",
			"schema": "m / application: any / purpose: any / context: any / index: num",
			"c": 500,
			"mem": 64,
			"dsLen": 64
		},
		"ds":
			"6f607779975982ed6a85a4c59adc69b15954c4da42c7beea618ec07f5cedda0bb4c4c1c3a3826acf5177ac258d8688b7958e2b3bca31377d2fd968f231569737"
	}
];

// TextEncoder Instance
const encoder = new TextEncoder();

// Test for hbedf function.
// Iterates over the test vectors, for each, obtaining a derived seed from the ibm, secret,
// and configured with opts. The resulting derived seed is converted to a hex string. A label
// for the current iteration is created from the document number at index 0 of the ibm.
Deno.test(`Function 'hbedf' derives seeds from biographic material and secrets`, async () => {
	for (const { h, ibm, secret, opts, ds } of vectors) {
		const bIbm: Uint8Array[] = ibm.map((s) => encoder.encode(s));
		const bSecret = encoder.encode(secret);
		const seed = await hbedf(h, bIbm, bSecret, opts);
		const dsHex = bytesToHex(seed);
		const label = ibm.at(0);
		assert(dsHex == ds, `Mismatch for identity ${label}: got "${dsHex}", expected "${ds}"`);
	}
});

// Test for hbedfSync function.
// Iterates over the test vectors, for each, obtaining a derived seed from the ibm, secret,
// and configured with opts. The resulting derived seed is converted to a hex string. A label
// for the current iteration is created from the document number at index 0 of the ibm.
Deno.test(`Function 'hbedfSync' derives seeds from biographic material and secrets`, () => {
	for (const { h, ibm, secret, opts, ds } of vectors) {
		const bIbm: Uint8Array[] = ibm.map((s) => encoder.encode(s));
		const bSecret = encoder.encode(secret);
		const seed = hbedfSync(h, bIbm, bSecret, opts);
		const dsHex = bytesToHex(seed);
		const label = ibm.at(0);
		assert(dsHex == ds, `Mismatch for identity ${label}: got "${dsHex}", expected "${ds}"`);
	}
});
