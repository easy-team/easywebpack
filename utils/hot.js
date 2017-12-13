'use strict';
if (typeof window === 'object') {
  var hotClient = require('webpack-hot-middleware/client?noInfo=false&reload=true&quiet=false&autoConnect=false');
  var currentHash;
  hotClient.setOptionsAndConnect({
    path: EASY_ENV_HOST_URL + '/__webpack_hmr'
  });
  hotClient.subscribeAll(event => {
    if (event.action === 'built' && currentHash) {
      var request = new XMLHttpRequest();
      var requestPath = EASY_ENV_PUBLIC_PATH + currentHash + '.hot-update.json';
      request.open("GET", requestPath, true);
      request.timeout = 5000;
      request.send(null);
      request.onreadystatechange = function() {
        if (request.readyState === 4) {
          if (request.status === 200) {
            try {
              var update = JSON.parse(request.responseText);
              var c = update.c;
              if (!c || JSON.stringify(c) === '{}' || JSON.stringify(c) === '{"0":true}') {
                var links = document.getElementsByTagName('link');
                for (var i = 0; i < links.length; i++) {
                  var href = links[i].href;
                  if (href && /\.css$/.test(href)) {
                    links[i].href = href;
                    console.log('[HMR] ' + href + ' updated.');
                  }
                }
              }
            } catch (e) {
              console.log('Get hot-update.json content error', e);
            }
          }
        }
      };
    }
    currentHash = event.hash;
  });
}