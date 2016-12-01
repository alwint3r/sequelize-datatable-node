module.exports = {
    "extends": "airbnb",
    "installedESLint": true,
    "plugins": [
        "react",
        "jsx-a11y",
        "import"
    ],
    "env": {
      "node": true,
      "mocha": true,
    },
    "rules": {
      "strict": 0,
      "quotes": [2, `backtick`],
      "comma-dangle": 0,
    }
};