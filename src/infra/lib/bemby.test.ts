import bemby from "./bemby.ts"

import {describe, expect, it} from "vitest"
describe("bemby", () => {
	it("should return the block name", () => {
		expect(bemby("block")).toBe("block")
	})

	it("should return the block name with modifiers", () => {
		expect(bemby("block", "modifier")).toBe("block block--modifier")
	})

	it("should return the block name with multiple modifiers", () => {
		expect(bemby("block", "modifier1", false, "modifier2")).toBe(
			"block block--modifier1 block--modifier2"
		)
	})

	it("should return the block name with object modifiers", () => {
		expect(
			bemby("block", {modifier1: true, modifier2: false, modifier3: true})
		).toBe("block block--modifier1 block--modifier3")
	})

	it("supports an array", () => {
		expect(bemby("block", ["a", "b"])).toBe("block block--a block--b")
	})

	it("can handle an undefined modifiers", () => {
		expect(bemby("block", undefined)).toBe("block")
	})

	it("splits on whitespace", () => {
		expect(bemby("block", "a b c")).toBe("block block--a block--b block--c")
	})
})
