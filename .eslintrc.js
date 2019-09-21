module.exports = {
    "parser": "babel-eslint",
    "extends": "airbnb-base",
    "env": {
        "browser": true,
        "node": true
    },
    "rules": {
        "indent": [ 1, "tab" ],
        "no-tabs": 0,
        "comma-dangle": ["error", "always-multiline"],
        "template-curly-spacing": "off",
        "indent": "off",
        "quotes": ["error", "double", { "allowTemplateLiterals": true }],
        "consistent-return": 0,
        "no-restricted-globals": 0,
        "no-use-before-define": ["error", { "functions": false, "classes": false }],
    }
}
