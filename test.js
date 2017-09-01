const url = require('url');
const queryString  = require("querystring");
const urlStr = 'app/web/page/app/app.js?loader=false&a=1'
const myURL = url.parse(urlStr);
console.log(myURL, queryString.parse(myURL.query));

