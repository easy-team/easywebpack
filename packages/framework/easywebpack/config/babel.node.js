'use strict';
module.exports = {
  "presets": [
    ["@babel/preset-env", {
      "modules": false,
      "targets": {
        "node": "current" 
      }
    }]
  ]
}