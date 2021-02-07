'use strict';
module.exports = {
  "presets": [
    ["@babel/preset-env", {
      "modules": false,
      "targets": {
        "browsers": ["last 2 versions", "> 1%", "Android >= 4.0", "ios >= 9"]
      }
    }]
  ],
  "plugins": [
    ["@babel/plugin-proposal-decorators", { "legacy": true }],
    ["@babel/plugin-proposal-class-properties", { "loose": true }],
    "@babel/plugin-proposal-async-generator-functions",
    "@babel/plugin-proposal-object-rest-spread",
    "@babel/plugin-transform-object-assign",
    "@babel/plugin-syntax-dynamic-import",
    "@babel/plugin-transform-runtime"
  ],
  "comments": false
};