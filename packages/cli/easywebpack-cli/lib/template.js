
const path = require('path');
const fs = require('fs');
const inquirer = require('inquirer');
const cwd = process.cwd();
const artTemplate = require('art-template');
const { componentTemplate } = require('easy-template-config');
const mkdirp = require('mz-modules/mkdirp');
const Download = require('./download');

const allChoices = [
  {
    name: 'react-component',
    dist: path.resolve(cwd, 'src/component')
  },
  {
    name: 'react-hook-component',
    dist: path.resolve(cwd, 'src/component')
  },
  {
    name: 'react-redux',
    dist: path.resolve(cwd, 'src/store')
  },
  {
    name: 'react-router',
    dist: path.resolve(cwd, 'src/router')
  },
  new inquirer.Separator(),
  {
    name: 'vue-component',
    dist: path.resolve(cwd, 'src/component')
  },
  {
    name: 'vue-store',
    dist: path.resolve(cwd, 'src/store')
  },
  {
    name: 'vue-router',
    dist: path.resolve(cwd, 'src/router')
  },
  new inquirer.Separator(),
  {
    name: 'egg-controller',
    dist: path.resolve(cwd, 'app/controller')
  },
  {
    name: 'egg-middleware',
    dist: path.resolve(cwd, 'app/middleware')
  },
  {
    name: 'egg-service',
    dist: path.resolve(cwd, 'app/service')
  },
  new inquirer.Separator(),
  {
    name: 'webpack-config-react',
    filename: 'webpack.config.js',
    dist: cwd
  },
  {
    name: 'webpack-config-vue',
    filename: 'webpack.config.js',
    dist: cwd
  },
  new inquirer.Separator(),
  {
    name: 'eslint-vue',
    filename: '.eslintrc.js',
    dist: cwd
  },
  {
    name: 'eslint-react',
    filename: '.eslintrc.js',
    dist: cwd
  },
  {
    name: 'babel',
    filename: 'babel.config.js',
    dist: cwd
  },
  {
    name: 'tsconfig',
    filename: 'tsconfig.json',
    dist: cwd
  },
  {
    name: 'package',
    filename: 'package.json',
    dist: cwd
  },
  new inquirer.Separator()
];

const initPrompt = async (cli, options, choices) => {
  const anwser = await inquirer.prompt([{
    loop: false,
    type: 'list',
    name: 'template',
    default: '',
    message: 'What choice do you need?',
    choices
  }]);
  const templateItem = componentTemplate.componentAllChoice.find(item => {
    return item.name === anwser.template;
  });
  await downloadTemplate(cli, templateItem, options);
}

const downloadTemplate = async (cli, templateInfo, options) => {
  const d = new Download(options, cli);
  const pkgName = 'easyjs-awesome-template';
  const absSourceDir = await d.download(pkgName, templateInfo.name);
  // const absSourceDir = `/var/folders/dr/yn_tf3kj6tb7jx00dx6nvy940000gp/T/easywebpack-cli-init/easyjs-awesome-template/package/${templateInfo.name}`;
  const files = fs.readdirSync(absSourceDir);
  const dist = options.dist || templateInfo.dist;
  const filename = options.output || templateInfo.filename;
  const classname = options.classname || templateInfo.classname;
  await mkdirp(dist);
  files.forEach(name => {
    const file = path.join(absSourceDir, name);
    if (fs.statSync(file).isDirectory()) {
      d.copy(file, dist, { hide: false });
      d.green(`create ${d.chalk.yellow(templateInfo.name)} successfully [${d.chalk.yellow(path.join(dist, name))}]`);
    } else {
      const content = artTemplate(file, { classname });
      const filepath = path.resolve(dist, filename || name);
      fs.writeFileSync(filepath, content, 'utf-8');
      d.green(`create ${d.chalk.yellow(templateInfo.name)} successfully [${d.chalk.yellow(filepath)}]`);
    }
  });
}

module.exports = function initTemplateList(cli, options = {}) {
  const { template} = options;
  if (template) {
    const templateItem = allChoices.find(item => {
      return item.name === template;
    });
    if (templateItem) {
      downloadTemplate(cli, templateItem, options)
    } else {
      const matchChoices = allChoices.filter(item => {
        return item.name && item.name.indexOf(template) > -1;
      });
      if (matchChoices.length) {
        initPrompt(cli, options, matchChoices);
      }
    }
  } else {
    initPrompt(cli, options, allChoices);
  }
}