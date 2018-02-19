class Test{
  constructor(){
    this.configList = [];
  }
  get config(){
    return this.configList;
  }
}

const a= [1];

a.splice(-1,0, 22);
a.splice(-1,0, 33);
a.splice(-1,0, 44);
console.log(a);