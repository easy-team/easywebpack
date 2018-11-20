'use strict';
const expect = require('chai').expect;
const helper = require('./helper');
const WebpackClientBuilder = require('../lib/target/client')
const WebpackServerBuilder = require('../lib/target/server');
const path = require('path').posix;
const baseDir = path.join(__dirname, '..');

class VueClientBuilder extends WebpackClientBuilder {
  constructor(config) {
    super(config);
    this.mergeConfig({
      buildPath: 'dist/vue',
      publicPath: 'public/dist',
      plugins: {
        manifest: false
      }
    });
  }
}

describe('vue.test.js', () => {
  before(() => {
  });

  after(() => {
  });

  beforeEach(() => {
  });

  afterEach(() => {
  });

  describe('#webpack createWebpackPlugin test', () => {
    it('should vue solution client render solution config', () => {
      const builder = new VueClientBuilder({
        baseDir,
        entry: {
          include: __dirname,
          template: 'test/layout.html'
        }
      });
      const webpackConfig = builder.create();
      const plugins = webpackConfig.plugins;
      expect(webpackConfig.output.path).to.equal(path.join(baseDir, 'dist/vue'));
      expect(webpackConfig.output.publicPath).to.equal(`/public/dist/`);

      expect(!!helper.getPluginByLabel('manifest', plugins)).to.be.false;
    });

    it('should vue solution client render solution config override by custom config', () => {
      const builder = new VueClientBuilder({
        cost: true,
        baseDir,
        buildPath: 'dist/vue/override',
        publicPath: 'public/dist/override',
        entry: {
          include: __dirname,
          template: 'test/layout.html'
        }
      });
      const webpackConfig = builder.create();
      const plugins = webpackConfig.plugins;
      expect(webpackConfig.entry['base.test'].length).to.equal(2);
      expect(webpackConfig.entry['base.test'][0]).to.includes('webpack-hot-middleware');
      expect(webpackConfig.output.path).to.equal(path.join(baseDir, 'dist/vue/override'));
      expect(webpackConfig.output.publicPath).to.equal(`/public/dist/override/`);

      expect(!!helper.getPluginByLabel('manifest', plugins)).to.be.false;
    });

    it('should egg test', () => {
      const builder = new WebpackServerBuilder({ egg: true, baseDir: path.join(__dirname, '..') });
      const webpackConfig = builder.create();
      expect(webpackConfig.output.path).to.equal(path.join(__dirname, '../app/view'));
    });

    it('should vue ts framework loaders test', () => {
      const builder = new WebpackServerBuilder({
        loaders: {
          ts: true,
          vue: {
            test: /\.vue$/,
            exclude: /node_modules/,
            use() {
              const options = this.createFrameworkLoader('vue-style-loader');
              options.transformToRequire = { img: ['url', 'src'] };
              return [
                {
                  loader: 'vue-loader',
                  options
                }
              ];
            }
          }
        }
      });
      const webpackConfig = builder.create();
      const vueLoader = helper.getLoaderByName('vue', webpackConfig.module.rules);
      expect(vueLoader.use[0].options.loaders).to.include.keys(['ts', 'js', 'css']);
    });
    it('should vue typescript loaders framework test', () => {
      const builder = new WebpackServerBuilder({
        loaders: {
          typescript: true,
          vue: {
            test: /\.vue$/,
            exclude: /node_modules/,
            use() {
              const options = this.createFrameworkLoader('vue-style-loader');
              options.transformToRequire = { img: ['url', 'src'] };
              return [
                {
                  loader: 'vue-loader',
                  options
                }
              ];
            }
          }
        }
      });
      const webpackConfig = builder.create();
      const vueLoader = helper.getLoaderByName('vue', webpackConfig.module.rules);
      expect(vueLoader.use[0].options.loaders).to.include.keys(['ts', 'js', 'css']);
    });
    it('should vue typescript module rules test', () => {
      const builder = new WebpackServerBuilder({
        module: {
          rules: [
            { typescript: true },
            {
              vue: {
                test: /\.vue$/,
                exclude: /node_modules/,
                use() {
                  const options = this.createFrameworkLoader('vue-style-loader');
                  options.transformToRequire = { img: ['url', 'src'] };
                  return [
                    {
                      loader: 'vue-loader',
                      options
                    }
                  ];
                }
              }
            }
          ]
        }
      });
      const webpackConfig = builder.create();
      const vueLoader = helper.getLoaderByName('vue', webpackConfig.module.rules);
      expect(vueLoader.use[0].options.loaders).to.include.keys(['ts', 'js', 'css']);
    });
    it('should vue ts module rules test', () => {
      const builder = new WebpackServerBuilder({
        module: {
          rules: [
            { ts: true },
            {
              vue: {
                test: /\.vue$/,
                exclude: /node_modules/,
                use() {
                  const options = this.createFrameworkLoader('vue-style-loader');
                  options.transformToRequire = { img: ['url', 'src'] };
                  return [
                    {
                      loader: 'vue-loader',
                      options
                    }
                  ];
                }
              }
            }
          ]
        }
      });
      const webpackConfig = builder.create();
      const vueLoader = helper.getLoaderByName('vue', webpackConfig.module.rules);
      expect(vueLoader.use[0].options.loaders).to.include.keys(['ts', 'js', 'css']);
    });
    it('should vue ts module rules native config test', () => {
      const builder = new WebpackServerBuilder({
        module: {
          rules: [
            { ts: true },
            {
              test: /\.vue$/,
              exclude: /node_modules/,
              use() {
                const options = this.createFrameworkLoader('vue-style-loader');
                options.transformToRequire = { img: ['url', 'src'] };
                return [
                  {
                    loader: 'vue-loader',
                    options
                  }
                ];
              }
            }
          ]
        }
      });
      const webpackConfig = builder.create();
      const vueLoader = helper.getLoaderByName('vue', webpackConfig.module.rules);
      expect(vueLoader.use[0].options.loaders).to.include.keys(['ts', 'js', 'css']);
    });
  });
});
