import { build, emptyDir } from "jsr:@deno/dnt@0.42.1";

await emptyDir("./npm");

await build({
	entryPoints: ["./src/mod.ts"],
	outDir: "./npm",
	shims: {
		deno: true
	},
	test: false,
	package: {
		// package.json properties
		name: Deno.args[0],
		version: Deno.args[1],
		description:
			"Deterministic method of pseudorandom seed derivation from biographic material and secrets.",
		license: "MIT",
		homepage: "https://gitlab.com/jacobhaap/ts-hbedf#readme",
		repository: {
			type: "git",
			url: "git+https://gitlab.com/jacobhaap/ts-hbedf.git"
		},
		bugs: {
			url: "https://gitlab.com/jacobhaap/ts-hbedf/issues"
		},
		author: {
			name: "Jacob V. B. Haap",
			url: "https://iacobus.xyz/"
		},
		keywords: [
			"deterministic",
			"pseudorandom",
			"seed",
			"biographic",
			"entropy"
		]
	},
	postBuild() {
		// steps to run after building and before running the tests
		Deno.copyFileSync("LICENSE", "npm/LICENSE");
		Deno.copyFileSync("README.md", "npm/README.md");
	}
});
