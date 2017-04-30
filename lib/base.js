'use strict';
const merge = require('webpack-merge');
class WebpackBase {
  constructor(arr, options) {
    this.arr = arr;
    this.options = options;
  }

  create(options) {
    this.options = merge(this.options, options);
    this.arr = this.arr.map(item => {
      return item.create(this.options);
    });
    return this.arr;
  }

  setDefaultPlugin(arr) {
    this.create(arr);
  }

  add(item) {
    this.arr.push(item);
  }

  addBefore(item, name) {
    const position = this.position(name);
    if (position > -1) {
      this.arr.splice(position, 0, item);
    } else {
      this.arr.push(item);
    }
  }

  addAfter(item, name) {
    const position = this.position(name);
    if (position > -1) {
      this.arr.splice(position + 1, 0, item);
    } else {
      this.arr.push(item);
    }
  }

  position(name) {
    return this.arr.findIndex(item => {
      return item.constructor && item.constructor.name === name;
    });
  }

  remove(name) {
    const position = this.position(name);
    if (position > -1) {
      this.arr.splice(position, 1);
    }
  }

  update(name, params) {
    const arr = this.arr.filter(item => {
      return item.name === name;
    });
    arr.forEach(item => {
      const newItem = item.create(params);
      const position = this.position(name);
      this.arr.splice(position, 1, newItem);
    });
  }
}

module.exports = WebpackBase;
