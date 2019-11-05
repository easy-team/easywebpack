'use strict';
const assert = require('assert');
const chalk = require('chalk');
module.exports = {

  getConfigPlugin(label) {
    return this.utils.getConfigPlugin(this.config.plugins, label);
  },

  getPluginByName(label) {
    const defaultPlugins = this.utils.cloneDeep(this.plugins);
    const plugins = this.mergePlugin(this.config.plugins, defaultPlugins);
    if (plugins[label]) {
      plugins[label].args = this.parsePluginArgs(plugins[label], label);
    }
    return plugins[label];
  },

  addPlugin(plugin) {
    if (this.isWebpackPlugin(plugin)) {
      const pluginInfo = {};
      pluginInfo[plugin.constructor.name] = plugin;
      this.mergePlugin(pluginInfo);
    } else {
      this.mergePlugin(plugin);
    }
  },

  removePlugin(label) {
    delete this.plugins[label];
  },

  mergePlugin(plugins = {}, target) {
    target = target || this.plugins;
    const count = Object.keys(target).length;
    const clonePlugins = this.utils.cloneDeep(plugins);
    if (Array.isArray(clonePlugins)) {
      clonePlugins.forEach((plugin,index) => {
        if (this.isWebpackPlugin(plugin)) {
          plugin.label = plugin.constructor.name + (count + index);
        }
      });
    }
    const sourcePlugins = Array.isArray(clonePlugins) ? {} : clonePlugins;
    // 支持Webpack原生plugin配置
    if (Array.isArray(clonePlugins)) {
      clonePlugins.forEach(plugin => {
        if (this.isWebpackPlugin(plugin)) {
          sourcePlugins[plugin.label || plugin.constructor.name] = plugin;
        } else if (this.utils.isObject(plugin)) { // 兼容 Webpack 自定义 plugin配置
          if (plugin.name) {
            if (this.utils.isString(plugin.name)) {
              sourcePlugins[plugin.label || plugin.name] = plugin;
            } else if (this.isWebpackPlugin(plugin.name)) {
              sourcePlugins[plugin.label || plugin.name.constructor.name] = plugin;
            } else if (this.utils.isObject(plugin) && this.utils.isFunction(plugin.name) && plugin.name.name) {
              sourcePlugins[plugin.name.name] = plugin;
            }
          } else if (this.isWebpackApplyPlugin(plugin)) { // only apply method plugin
            const md5Label = this.utils.getPluginLabel(plugin);
            sourcePlugins[md5Label] = { name: plugin };
          } else if (Object.keys(plugin).length === 1) {
            const keyLabel = Object.keys(plugin)[0];
            sourcePlugins[keyLabel] = plugin[keyLabel];
          }
        }
      });
    }
    // 支持Webpack 自定义 plugin配置
    Object.keys(sourcePlugins).forEach(name => {
      const configPlugin = sourcePlugins[name];
      if (target[name]) {
        // enable function 优先级高
        if ((this.utils.isObject(configPlugin) || Array.isArray(configPlugin)) && configPlugin.enable !== false) {
          target[name].enable = true;
        }
        if (this.utils.isFunction(configPlugin.enable)) {
          target[name].enable = configPlugin.enable.apply(this);
        } else if (this.utils.isBoolean(configPlugin)) {
          target[name].enable = configPlugin;
        } else if (configPlugin.name || this.isWebpackPlugin(configPlugin) || this.isWebpackApplyPlugin(configPlugin)) { // 直接覆盖
          target[name] = configPlugin;
        } else {
          // 如果 name 和 args 不存在, configPlugin 直接作为args, 配置是可以省去 args key
          const args = configPlugin.args ? configPlugin.args : configPlugin;
          const nomalizeArgs = Array.isArray(args) ? [args] : args;
          if (target[name].concatArgs) {
            target[name].concatArgs = target[name].concatArgs.concat(nomalizeArgs);
          } else {
            target[name].concatArgs = [].concat(target[name].args || []).concat(nomalizeArgs);
          }
          const cloneConfigPlugin = this.utils.cloneDeep(configPlugin);
          delete cloneConfigPlugin.enable;
          delete cloneConfigPlugin.args;
          target[name] = this.merge(target[name], cloneConfigPlugin);
        }
      } else if (this.isWebpackPlugin(configPlugin) || this.isWebpackApplyPlugin(configPlugin) || this.isConfigPlugin(configPlugin)) {
        target[name] = configPlugin;
      }
    });
    return target;
  },

  parsePluginArgs(plugin, label) {
    try {
      const args = this.utils.isFunction(plugin.args) ? plugin.args.apply(this) : plugin.args;
      const concatArgs = (plugin.concatArgs || []).map(arg => {
        return this.utils.isFunction(arg) ? arg.apply(this) : arg;
      });
      if (!concatArgs.length) {
        return args;
      }
      const length = concatArgs.length;
      const firstArgs = concatArgs[0];
      // 解决 plugin 构造函数多参数合并问题
      if (Array.isArray(firstArgs)) {
        const exArgs = concatArgs.slice(1, length);
        firstArgs.forEach((item, index) => {
          if (index <= exArgs.length - 1) {
            if (this.utils.isObject(item) && this.utils.isObject(exArgs[index])) {
              concatArgs[0][index] = this.merge(item, exArgs[index]);
            } else {
              concatArgs[0][index] = exArgs[index];
            }
          }
        });
        return concatArgs;
      }
      if (Array.isArray(args) || this.utils.isString(args) || this.utils.isBoolean(args) || (this.utils.isObject(args) && args.test)) { // override
        return concatArgs[length - 1];
      }
      return concatArgs.reduce((arg, itemArgs) => {
        return this.merge(arg, itemArgs);
      }, args);
    } catch (e) {
      console.error('parsePluginArgs:', label, plugin, e);
    }
  },


  createPlugin(plugins) {
    const webpackPlugins = [];
    Object.keys(plugins).forEach(label => {
      const configInfo = plugins[label];
      if (this.isUse(configInfo)) {
        let plugin;
        let pluginName;
        if (this.isWebpackPlugin(configInfo)) { // 如果直接是 new Plugin 方式
          plugin = configInfo;
          pluginName = configInfo.constructor.name;
        } else if (this.utils.isObject(configInfo.name)) { // plugin object
          plugin = configInfo.name;
          pluginName = plugin.constructor && plugin.constructor.name || label;
        } else if (this.isWebpackApplyPlugin(configInfo)) {
          plugin = configInfo;
          pluginName = label;
        } else if (this.utils.isString(configInfo.name) || this.utils.isFunction(configInfo.name)) {
          let Clazz = configInfo.name;
          if (this.utils.isString(configInfo.name)) {
            pluginName = configInfo.name;
            Clazz = this.utils.requireModule(configInfo.name, this.modules);
          } else if (this.utils.isFunction(configInfo.name)) {
            pluginName = configInfo.name.name;
          }
          assert(Clazz, chalk.red(`dynamic create plugin[${label}] error, please check the npm module [${pluginName}] whether installed. ${chalk.yellow('if not installed, please execute below command in command line:')}\r\n
            ${chalk.green('npm')}: npm install ${pluginName} --save-dev\r\n
            ${chalk.green('cnpm')}: cnpm install ${pluginName} --save-dev\r\n
            ${chalk.green('tnpm')}: tnpm install ${pluginName} --save-dev\r\n
            ${chalk.green('yarn')}: yarn install ${pluginName} --save-dev\r\n`
          ));
          if (configInfo.entry) {
            Clazz = Clazz[configInfo.entry];
          }
          if (configInfo.args || configInfo.concatArgs) {
            const args = this.parsePluginArgs(configInfo, label);
            plugin = new (Function.prototype.bind.apply(Clazz, [null].concat(args)))();
          } else {
            plugin = new Clazz();
          }
        }
        if (plugin) {
          plugin.__plugin__ = pluginName;
          plugin.__lable__ = label;
          webpackPlugins.push(plugin);
        }
      }
    });
    return webpackPlugins;
  },

  installPlugin(plugins) {
    const dependencies = this.dependencies;
    const enablePlugins = {};
    Object.keys(plugins).forEach(name => {
      const pluginInfo = plugins[name];
      if (this.isUse(pluginInfo)) {
        enablePlugins[name] = pluginInfo;
      }
    });
    return this.utils.installPlugin(enablePlugins, dependencies, this.modules, this.config.install);
  },

  adapterPlugin(plugins) {},

  createWebpackPlugin(config) {
    this.mergePlugin(config.plugins);
    this.installPlugin(this.plugins);
    this.adapterPlugin(this.plugins);
    return this.createPlugin(this.plugins);
  }
};