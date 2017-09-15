'use strict';
const util = require('util');
const path = require('path').posix;
const chalk = require('chalk');
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
    try {
      require(path.join(m, name));
      return true;
    } catch (e) {
      return false;
    }
  });
  return module ? require(path.join(module, name)) : null;
};

exports.isInstalled = (name, modules) => {
  return !!exports.requireModule(name, modules);
};

exports.install = (deps, options) => {

  if (!deps || !deps.length) return;

  console.log(chalk.green('easywebpack: install webpack dynamic npm module:'), deps);

  options = Object.assign({}, { save: false, dev: false, quiet: false, npm: 'npm' }, options);

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

  // RegExps track return a single result each time
  while (matches = PEERS.exec(output.stdout)) {
    const dep = matches[1];
    const version = matches[2];
    if (version.match(' ')) {
      peersDeps.push(dep);
    } else {
      peersDeps.push(util.format('%s@%s', dep, version));
    }
  }

  if (peersDeps.length) {
    this.install(peersDeps, options);
  }

  return output;
};

exports.getDeps = (configDeps, defaultDeps) => {
  const deps = Object.assign({}, defaultDeps);
  if (configDeps) {
    Object.keys(configDeps).forEach(name => {
      deps[name] = configDeps;
    });
  }
  return deps;
};

exports.installLoader = (rules, deps, modules) => {
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
  exports.install(pkgs);
};

exports.installPlugin = (plugins, deps, modules) => {
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
  exports.install(pkgs);
};





