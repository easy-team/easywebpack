'use strict';
module.exports = (context, source, options, config) => {
  context.cacheable();
  return `
    import React from 'react';
    import ReactDom from 'react-dom';
    import { AppContainer } from 'react-hot-loader';
    import Entry from '${context.resourcePath.replace(/\\/g, '\\\\')}';
    const state = window.__INITIAL_STATE__;
    const render = (App)=>{
      const root = document.getElementById('app');
      const renderMode = root.childNodes.length > 0 ? 'hydrate' : 'render';
      ReactDom[renderMode](EASY_ENV_IS_DEV ? <AppContainer><App {...state} /></AppContainer> : <App {...state} />, root);
    };

    if (EASY_ENV_IS_DEV && module.hot) {
      module.hot.accept('${context.resourcePath.replace(/\\/g, '\\\\')}', () => { render(Entry) });
    }
    render(Entry);
  `;
};