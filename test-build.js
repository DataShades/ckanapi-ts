const assert = require("assert");
const mod = require("./dist");

assert.deepStrictEqual(mod.CkanApi.a, {name: "hello"})
