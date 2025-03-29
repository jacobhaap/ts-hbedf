import { build, emptyDir } from "jsr:@deno/dnt@0.41.3";

await emptyDir("./npm");

await build({
  entryPoints: ["./src/mod.ts", { name: "./utils", path: "./src/utils/mod.ts" }],
  outDir: "./npm",
  shims: {
    deno: true,
  },
  package: {
    // package.json properties
    name: Deno.args[0],
    version: Deno.args[1],
    description: "Deterministic Method of Entropy Derivation from Human Identity and Secrets.",
    license: "MIT",
    homepage: "https://gitlab.com/jacobhaap/ts-hbedf#readme",
    repository: {
      type: "git",
      url: "git+https://gitlab.com/jacobhaap/ts-hbedf.git",
    },
    bugs: {
      url: "https://gitlab.com/jacobhaap/ts-hbedf/issues",
    },
    author: {
        name: "Jacob V. B. Haap",
        url: "https://iacobus.xyz/"
    },
    keywords: [
        "hbedf",
        "entropy",
        "deterministic",
        "pseudorandom"
    ],
  },
  postBuild() {
    // steps to run after building and before running the tests
    Deno.copyFileSync("LICENSE", "npm/LICENSE");
    Deno.copyFileSync("README.md", "npm/README.md");
  },
});
