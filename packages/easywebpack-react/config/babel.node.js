'use strict';
module.exports = {
  "presets": [
    "@babel/preset-react", 
    ["@babel/preset-env", {
      "modules": false,
      "targets": {
        "node": "current" 
      }
    }]
  ]
}