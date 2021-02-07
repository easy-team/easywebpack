'use strict';
module.exports = (context, source, options, config) => {
  return `
    import Vue from 'vue';
    ${config.codeSegment}
    import vm from '${context.resourcePath.replace(/\\/g, '\\\\')}';
    const initState = window.__INITIAL_STATE__ || {};
    const context = { state: initState };
    const hook = vm.hook || Vue.hook || {};
    const render = hook.render || vm.hookRender || Vue.hookRender;
    if (render) {
      render(context, vm);
    }
    const store = typeof vm.store === 'function' ? vm.store(initState) : vm.store;
    const router = typeof vm.router === 'function' ? vm.router() : vm.router;
    const data = typeof vm.data === 'function' ? vm.data() :  {};
    const options = store && router ? {
      ...vm, 
      store,
      router
    } : { 
      ...vm,
      ...{
        data() {
          return { ...initState, ...data};
        }
      } 
    };
    const app = new Vue({
      store,
      router,
      render: h => h(vm)
    });
    const root = document.getElementById('app');
    const hydrate = root.childNodes.length > 0;
    app.$mount(root, hydrate);
  `;
};