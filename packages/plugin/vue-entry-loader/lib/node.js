'use strict';
module.exports = (context, source, options, config) => {
  return `
    import Vue from 'vue';
    ${config.codeSegment}
    import vm from '${context.resourcePath.replace(/\\/g, '\\\\')}';
    export default function(context) {
      const store = typeof vm.store === 'function' ? vm.store(context.state) : vm.store;
      const router = typeof vm.router === 'function' ? vm.router() : vm.router;
      if (store && router) {
        const sync = require('vuex-router-sync').sync;
        sync(store, router);
        router.push(context.state.url);
        return new Promise((resolve, reject) => {
          router.onReady(() => {
            const matchedComponents = router.getMatchedComponents();
            if (!matchedComponents) {
              return reject({ code: '404' });
            }
            return Promise.all(
              matchedComponents.map(component => {
                if (component.methods && component.methods.fetchApi) {
                  return component.methods.fetchApi(store);
                }
                return null;
              })
            ).then(() => {
              context.state = { ...store.state, ...context.state };
              const hook = vm.hook || Vue.hook || {};
              const render = hook.render || vm.hookRender || Vue.hookRender;
              if (render) {
                render(context, vm);
              }
              const instanceOptions = {
                ...vm,
                store,
                router,
              };
              return resolve(new Vue(instanceOptions));
            });
          });
        });
      }
      const VueApp = Vue.extend(vm);
      const hook = vm.hook || Vue.hook || {};
      const render = hook.render || vm.hookRender || Vue.hookRender;
      if (render) {
        render(context, vm);
      }
      const instanceOptions = {
        ...vm,
        data: context.state
      };
      return new VueApp(instanceOptions);
    };
  `;
};