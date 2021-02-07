# vue-entry-loader

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/vue-entry-loader.svg?style=flat-square
[npm-url]: https://npmjs.org/package/vue-entry-loader
[travis-image]: https://img.shields.io/travis/hubcarl/vue-entry-loader.svg?style=flat-square
[travis-url]: https://travis-ci.org/hubcarl/vue-entry-loader
[codecov-image]: https://img.shields.io/codecov/c/github/hubcarl/vue-entry-loader.svg?style=flat-square
[codecov-url]: https://codecov.io/github/hubcarl/vue-entry-loader?branch=master
[david-image]: https://img.shields.io/david/hubcarl/vue-entry-loader.svg?style=flat-square
[david-url]: https://david-dm.org/hubcarl/vue-entry-loader
[snyk-image]: https://snyk.io/test/npm/vue-entry-loader/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/vue-entry-loader
[download-image]: https://img.shields.io/npm/dm/vue-entry-loader.svg?style=flat-square
[download-url]: https://npmjs.org/package/vue-entry-loader

easywebpack Vue Entry Template, simplify Vue initialization without writing javascript file(`.js`) init code, support client render and server side render.

## Vue Initialization Template


When Wepback's entry configuration is directly a `.vue` file, The following template code, webpack will be automatically merged with the Vue file.


### Client Render Initialization Template

```js
import Vue from 'vue';
// .vue file 
import vm from '${context.resourcePath}';
// ${codeSegment} dynamic template code template file
const data = window.__INITIAL_STATE__ || {};
const context = { state: data };
const hook = vm.hook || Vue.hook;
if (hook && hook.render) {
  hook.render(context, vm);
}
const store = typeof vm.store === 'function' ? vm.store(data) : vm.store;
const router = typeof vm.router === 'function' ? vm.router() : vm.router;
const options = store && router ? {
  ...vm, 
  store,
  router
} : { ...vm, data };
const app = new Vue(options);
app.$mount('#app');
```


### Server Side Render Initialization Template

```js
import Vue from 'vue';
import { sync } from 'vuex-router-sync';
// .vue file 
import vm from '${context.resourcePath}';
// ${codeSegment} dynamic template code template file
export default function(context) {
  const store = typeof vm.store === 'function' ? vm.store(context.state) : vm.store;
  const router = typeof vm.router === 'function' ? vm.router() : vm.router;
  if (store && router) {
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
          const hook = vm.hook || Vue.hook;
          if (hook && hook.render) {
            hook.render(context, vm);
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
  const hook = vm.hook || Vue.hook;
  if (hook && hook.render) {
    hook.render(context, vm);
  }
  const instanceOptions = {
    ...vm,
    data: context.state
  };
  return new VueApp(instanceOptions);
};
```

## Usage

### Vue Entry File

```js
// ${root}/egg-vue-webpack-boilerplate/app/web/page/admin/home/home.vue
import Vue from 'vue';
import ElementUI from 'element-ui';
import VueI18n from 'vue-i18n';
import 'element-ui/lib/theme-chalk/index.css';
import createI18n from 'framework/i18n/admin';
import store from './store';
import router from './router';

Vue.use(VueI18n);
Vue.use(ElementUI);

export default {
  router,
  store,
  components: {},
  computed: {},
  hook :{
    render(context, vm) {
      const i18n = createI18n(context.state.locale);
      vm.i18n = i18n;
    }
  },
  mounted() {},
};
```

### easywebpack Entry Config

```js
module.exports = {
  entry: {
    app: 'app/web/page/admin/home/home.vue', // The entry will use the vue-entry-loader, not need to write the Vue initialization code
    test: 'app/web/page/test/test.js' // The entry will not use the vue-entry-loader, you need to write the Vue initialization code
  }
};
```

## Feature

### Dynamic Inject Template Code

```js
import codeSegment from '${templateFile}'
codeSegment(Vue);
```

- Egg Project will inject the custom template code into the location above `${codeSegment}` when the file `app/web/framework/entry/template.js` exists
- Non Egg Project will inject the custom template code into the location above `${codeSegment}` when the file `src/framework/entry/template.js` exists
- The `entry/template.js` template file has the following constraints: 

    - import path must be absolute path, you can use webpack alias set
    - export default must return function, the argument is Vue

```js
// import path must be absolute path, you can use webpack alias set
import Layout from 'component/layout/index'; 
import plugin from 'framework/plugin';

// must return function, the argument is Vue
export default function(Vue) {
  Vue.use(plugin);
  Vue.component(Layout.name, Layout);
}
```

### Vue Entry File Initialization Hook Support

support `hook.render` method for custom logic, such common component and logic initialization

```js
export default {
  hook :{
    render(context, vm) {
      const i18n = createI18n(context.state.locale);
      vm.i18n = i18n;
    }
  },
  computed: {},
  mounted() {},
};
```

### Vue Entry File Initialization Dynamic Store and Router

**dynamic create store, solve the server side render singleton problem**

```js
// store/index.js
export default function createStore(initState) {
  const state = {
    ...initState
  };
  return new Vuex.Store({
    state,
    actions,
    getters,
    mutations
  });
}
```

- Dynamic Create Router

```js
export default function createRouter() {
  return new VueRouter({
    mode: 'history',
    base: '/',
    routes: [
      {
        path: '/',
        component: Dashboard
      },
      {
        path: '*', component: () => import('../view/notfound.vue')
      }
    ]
  });
}
```

- Vue Entry File Code

```js
import store from './store';
import router from './router';

export default {
  router, // support Object and Function
  store,  // support Object and Function
  components: {},
  computed: {},
  mounted() {},
};
```

## License

[MIT](LICENSE)
