/* eslint-env jest */
import isPrimitive from "../isprimitive";

describe("isPrimitive", () => {
    it("it returns true only for strings, numbers, and booleans", () => {
        expect(isPrimitive(0)).toBe(true);
        expect(isPrimitive("")).toBe(true);
        expect(isPrimitive(true)).toBe(true);

        expect(isPrimitive({})).toBe(false);
        expect(isPrimitive([])).toBe(false);
        expect(isPrimitive(new Map())).toBe(false);
        expect(isPrimitive(new Set())).toBe(false);
        expect(isPrimitive(new WeakMap())).toBe(false);
        expect(isPrimitive(new WeakSet())).toBe(false);
    });
});
