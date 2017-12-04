'use strict';
const util = require('util');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const os = require('os');
const spawn = require('cross-spawn');
const PEERS = /UNMET PEER DEPENDENCY ([a-z\-0-9\.]+)@(.+)/gm;

exports.requireModule = (name, modules) => {
  if (typeof name === 'object') {
    return name;
  }
  if (path.isAbsolute(name)) {
    return require(name);
  }

  const module = modules.find(m => {
    const modulepath = path.join(m, name);
    return fs.existsSync(modulepath);
  });
  return module ? require(path.join(module, name)) : null;
};

exports.isInstalled = (name, modules) => {
  return !!exports.requireModule(name, modules);
};

exports.install = (deps, modules, options, type) => {

  if (!deps || !deps.length) {
    return;
  }

  console.log(chalk.green(`easywebpack: install webpack dynamic ${type} npm module:\r\n`), deps);

  options = Object.assign({}, { save: true, dev: true, quiet: false, npm: 'npm' }, options);

  const args = ['install'].concat(deps).filter(Boolean);

  if (options.save) {
    args.push(options.dev ? '--save-dev' : '--save');
  }

  if (options.quiet) {
    args.push('--silent', '--no-progress');
  }

  // Ignore input, capture output, show errors
  const output = spawn.sync(options.npm, args, {
    stdio: ['ignore', 'pipe', 'inherit']
  });

  let matches;
  const peersDeps = [];
  if (os.platform() === 'regex_test') { // windows not match PEERS
    // RegExps track return a single result each time
    while (matches = PEERS.exec(output.stdout)) {
      const dep = matches[1];
      const version = matches[2];
      if (!exports.isInstalled(dep, modules)) {
        if (version.match(' ')) {
          peersDeps.push(dep);
        } else {
          peersDeps.push(util.format('%s@%s', dep, version));
        }
      }
    }
  } else {
    deps.forEach(dep => {
      const name = dep.split('@')[0];
      const module = modules.find(m => {
        const modulepath = path.join(m, name);
        return fs.existsSync(modulepath);
      });
      if (module) {
        const pkgpath = path.join(module, name, 'package.json');
        const pkg = require(pkgpath);
        const peerDependencies = pkg.peerDependencies;
        if (peerDependencies) {
          Object.keys(peerDependencies).forEach(pkgName => {
            if (!exports.isInstalled(pkgName, modules)) {
              peersDeps.push(`${pkgName}@${peerDependencies[pkgName]}`);
            }
          });
        }
      }
    });
  }

  if (peersDeps.length) {
    return this.install(peersDeps, modules, options, 'peer');
  }

  return deps.length;
};

exports.getDeps = (configDeps, defaultDeps) => {
  const deps = Object.assign({}, defaultDeps);
  if (configDeps) {
    Object.keys(configDeps).forEach(name => {
      deps[name] = configDeps[name];
    });
  }
  return deps;
};

exports.installLoader = (rules, deps, modules, options = {}) => {
  if (options.check === false) return;
  const pkgs = [];
  rules.forEach(rule => {
    if (Array.isArray(rule.use)) {
      rule.use.forEach(loader => {
        const name = typeof loader === 'object' ? loader.loader : loader;
        if (!exports.isInstalled(name, modules)) {
          const pkg = deps[name] ? `${name}@${deps[name]}` : name;
          if (!pkgs.includes(pkg)) {
            pkgs.push(pkg);
          }
        }
      });
    }
  });
  return exports.install(pkgs, modules, options, 'loader');
};

exports.installPlugin = (plugins, deps, modules, options = {}) => {
  if (options.check === false) return;
  const pkgs = [];
  Object.keys(plugins).forEach(key => {
    const name = plugins[key].name;
    if (typeof name === 'string') {
      if (!exports.isInstalled(name, modules)) {
        const pkg = deps[name] ? `${name}@${deps[name]}` : name;
        if (!pkgs.includes(pkg)) {
          pkgs.push(pkg);
        }
      }
    }
  });
  return exports.install(pkgs, modules, options, 'plugin');
};