'use strict';
const path = require('path');
const fs = require('fs');
const os = require('os');
const urllib = require('urllib');
const assert = require('assert');
const shell = require('shelljs');
const ora = require('ora');
const compressing = require('compressing');
const rimraf = require('mz-modules/rimraf');
const mkdirp = require('mz-modules/mkdirp');
const Logger = require('./logger');
const DEPS_MAPPING = {
  scss: {
    'node-sass': '^4.5.3',
    'sass-loader': '^10.0.2'
  },
  less: {
    'less': '^3.0.0',
    'less-loader': '^7.0.0'
  },
  stylus: {
    'stylus': '^0.54.5',
    'stylus-loader': '^3.0.0'
  }
};
// 参考 egg-init 实现
module.exports = class Download extends Logger {
  constructor(config = {}, cli = {}) {
    super(cli);
    this.config = config;
    this.cli = cli;
    this.tempDir = path.join(os.tmpdir(), `${this.cli.name}-init`);
    this.registry = config.registry || 'https://registry.npmjs.org';
  }

  async getPackageInfo(pkgName) {
    this.green(`query npm info of ${pkgName}`);
    const url = `${this.registry}/${pkgName}/latest`;
    try {
      const result = await urllib.request(url, {
        dataType: 'json',
        followRedirect: true,
        timeout: 30000
      });
      assert(result.status === 200, `npm info ${pkgName} got error: ${result.status}, ${result.data.reason}`);
      return result.data;
    } catch (err) {
      /* istanbul ignore next */
      throw err;
    }
  }

  async download(pkgName, dir = '') {
    const result = await this.getPackageInfo(pkgName);
    const tgzUrl = result.dist.tarball;
    await rimraf(this.tempDir);

    this.green(`downloading ${tgzUrl}`);
    const response = await urllib.request(tgzUrl, { streaming: true, followRedirect: true });
    const targetDir = path.join(this.tempDir, pkgName);
    await compressing.tgz.uncompress(response.res, targetDir);

    this.green(`extract to ${this.tempDir}`);
    return path.join(targetDir, 'package', dir);
  }

  copy(sourceDir, targetDir, option = { dir: '', hide: true }) {
    if (option.dir) {
      shell.cp('-R', path.join(sourceDir, option.dir), targetDir);
    } else {
      shell.cp('-R', path.join(sourceDir, '*'), targetDir);
      if (option.hide) { // copy hide file
        try {
          shell.cp('-R', path.join(sourceDir, '.*'), targetDir);
        } catch (e) {
          /* istanbul ignore next */
          this.yellow('copy hide file error', e);
        }
      }
    }
  }

  writeFile(filepath, content) {
    try {
      fs.writeFileSync(filepath, typeof content === 'string' ? content : JSON.stringify(content, null, 2), 'utf8');
    } catch (e) {
      /* istanbul ignore next */
      this.red(`writeFile ${filepath} err`, e);
    }
  }

  updatePackageFile(fileDir, info = {}) {
    const { name, description, style } = info;
    const filepath = path.join(fileDir, 'package.json');
    const packageJSON = require(filepath);
    const { devDependencies = {}, webpack = {} } = packageJSON;
    webpack.loaders = webpack.loaders || {};

    packageJSON.name = name || packageJSON.name;
    packageJSON.version = '1.0.0';
    packageJSON.description = description || packageJSON.description;
    if (style) {
      webpack.loaders[style] = true;
      Object.keys(DEPS_MAPPING[style]).forEach(depsName => {
        devDependencies[depsName] = DEPS_MAPPING[style][depsName];
      });
    }
    packageJSON.devDependencies = devDependencies;
    packageJSON.webpack = webpack;

    this.writeFile(filepath, packageJSON);
  }

  installDeps(projectDir, info) {
    const { npm } = info;
    if (npm) {
      const cmd = `${npm} install`;
      const spinner = ora(this.green(`start ${cmd}...`));
      spinner.start()
      const result = shell.exec(cmd, { cwd: projectDir, stdio: ['inherit'] });
      if (result) {
        if (result.code === 0) {
          this.green(`${cmd} successfully!`);
        } else {
          this.red(`${cmd} error`, result.stderr);
        }
      }
      spinner.stop();
    }
  }

  copyTemplate(targetDir) {
    const sourceDir = path.resolve(__dirname, '../template');
    if (fs.existsSync(sourceDir)) {
      this.copy(sourceDir, targetDir, { hide: true });
    }
  }

  quickStart(projectName, info) {
    let i = 1;
    const { npm, run } = info;
    const steps = [`${i}) cd ${projectName}`];
    if (!npm) {
      i++;
      steps.push(`${i}) npm install or yarn install`);
    }
    i++;
    steps.push(`${i}) ${run || 'npm run dev or npm start'}`);

    this.green(`Now, start coding by follow step:\r\n${steps.join('\r\n')}`);
  }

  async init(root, bilerplateInfo, projectInfoAnswer = {}, options = {}) {
    const self = this;
    const { pkgName, sourceDir = '', run, value } = bilerplateInfo;
    const { name, npm } = projectInfoAnswer;
    const projectName = name || value || pkgName;
    const green = this.green.bind(this);
    const absSourceDir = await self.download(pkgName, sourceDir);
    const absTargetDir = path.join(root, projectName);
    await mkdirp(absTargetDir);
    self.copy(absSourceDir, absTargetDir);
    self.copyTemplate(absTargetDir);
    self.updatePackageFile(absTargetDir, projectInfoAnswer);
    green(`init ${projectName} project successfully!\r\n`);
    self.installDeps(absTargetDir, { npm });
    self.quickStart(projectName, { npm, run });
  }
};