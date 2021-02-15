
const easywebpack = require('easywebpack-html');
const webpackConfig = new easywebpack.WebpackClientBuilder(require('../webpack.config')).create();
if(process.env.NODE_SERVER){
  easywebpack.server(webpackConfig, {}, () => {});
}else{
  easywebpack.build(webpackConfig, {}, () => {});
}
