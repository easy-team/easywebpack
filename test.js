const merge = require('webpack-merge');

const m1 = {
  args(){
    console.log(111);
  }
};

const m2 = {
  args: {
    a: 1,
    b: 2
  }
};
console.log(merge({
  customizeObject(a, b, key){
    if (key === 'args') {
      return Array.prototype.push.apply(...a, ...b);
    }
    return undefined;
  }
})(m1, m2));
