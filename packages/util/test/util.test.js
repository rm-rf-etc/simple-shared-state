const stripDeep = require("../deepomit").default;

const testNested = {
    _: {
        a: 1,
        b: "2",
    },
    a: 1,
    b: "2",
    c: {
        _: {
            a: 1,
            b: "2",
        },
        a: 1,
        b: "2",
        c: {
            _: {
                a: 1,
                b: "2",
            },
            a: 1,
            b: "2",
        },
    },
};

describe("util method stripDeep", () => {
    it("removes `_` property", () => {
        expect(stripDeep(testNested)).toEqual({
            a: 1,
            b: "2",
            c: {
                a: 1,
                b: "2",
                c: {
                    a: 1,
                    b: "2",
                },
            },
        });
    })
})
