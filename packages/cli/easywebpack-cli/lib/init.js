'use strict';
const inquirer = require('inquirer');
const Download = require('./download');

module.exports = class Boilerplate {
  constructor(config = {}, cli = {}) {
    this.config = config;
    this.cli = cli;
    this.projectDir = process.cwd();
    this.ask = this.initAsk();
    this.boilerplateChoice = config.boilerplateChoice || this.ask.boilerplateChoice;
    this.boilerplateDetailChoice = config.boilerplateDetailChoice || this.ask.boilerplateDetailChoice;
    this.projectAskChoice = config.projectAskChoice || this.ask.projectAskChoice;
  }

  initAsk() {
    const { boilerplateTemplate } = require('easy-template-config');
    return boilerplateTemplate;
  }

  getBoilerplateInfo(name) {
    return this.boilerplateChoice.find(item => {
      return name === item.value;
    });
  }

  setBoilerplateInfo(boilerplateChoice) {
    this.boilerplateChoice = boilerplateChoice;
  }

  getBoilerplateDetailInfo(boilerplate, project) {
    const filterItems = this.boilerplateDetailChoice[boilerplate].filter(item => project === item.value);
    return filterItems.length > 0 ? filterItems[0] : null;
  }

  setBoilerplateDetailInfo(boilerplateDetailChoice) {
    this.boilerplateDetailChoice = boilerplateDetailChoice;
  }

  setProjectAskChoice(projectAskChoice) {
    this.projectAskChoice = projectAskChoice;
  }

  getProjectAskChoices(ranges) {
    if (ranges === undefined) {
      return this.projectAskChoice;
    }
    return ranges.map(range => {
      return this.projectAskChoice.filter(choice => {
        return choice.name === range;
      })[0];
    });
  }

  async init(options) {
    const download = new Download(options, this.cli);
    // 直接下载
    const pkgName = options.package;
    if (pkgName) {
      const choices = ['name', 'description', 'npm'];
      const projectInfoChoice = this.getProjectAskChoices(choices);
      inquirer.prompt(projectInfoChoice).then(projectInfoAnswer => {
        const specialBoilerplateInfo = { pkgName };
        download.init(this.projectDir, specialBoilerplateInfo, projectInfoAnswer);
      });
    } else {
      const boilerplateAnswer = await inquirer.prompt([{
        type: 'list',
        name: 'boilerplateName',
        message: 'please choose the boilerplate mode?',
        choices: this.boilerplateChoice
      }]);
      const boilerplateName = boilerplateAnswer.boilerplateName;
      const boilerplateInfo = this.getBoilerplateInfo(boilerplateName);
      const choices = boilerplateInfo.choices;
      if (this.boilerplateDetailChoice[boilerplateName]) {
        const boilerplateDetailAsk = [{
          type: 'list',
          name: 'project',
          message: 'please choose the boilerplate project mode?',
          choices: this.boilerplateDetailChoice[boilerplateName]
        }];
        const boilerplateDetailAnswer = await inquirer.prompt(boilerplateDetailAsk)
        const project = boilerplateDetailAnswer.project;
        const bilerplateInfo = this.getBoilerplateDetailInfo(boilerplateName, project);
        const projectInfoChoice = this.getProjectAskChoices(bilerplateInfo.choices || choices);
        const projectInfoAnswer = await inquirer.prompt(projectInfoChoice);
        await download.init(this.projectDir, bilerplateInfo, projectInfoAnswer);
      } else {
        const pkgName = boilerplateInfo.pkgName || boilerplateName;
        const projectInfoChoice = this.getProjectAskChoices(choices);
        const projectInfoAnswer = await inquirer.prompt(projectInfoChoice);
        const specialBoilerplateInfo = { pkgName, run: boilerplateInfo.run };
        await download.init(this.projectDir, specialBoilerplateInfo, projectInfoAnswer);
      }
    }
  };
};