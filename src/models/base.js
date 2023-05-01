'use strict';

const { Results } = require('./results');

class Base {
  constructor(danger) {
    this.danger = danger
    this.result = new Results();
  }
  danger() {
    console.log(this.danger.git);
  }
  git() {
    console.log(this.danger.git);
  }

  get repo() {
    return this.danger.gitlab.metadata.repoSlug.toLowerCase();
  }
  // add
  addWarn(msg) {
    this.result.addWarn(msg)
  }
  addMsg(msg) {
    this.result.addMsg(msg)
  }
  //

  get committedFiles() {
    return [
      ...this.danger.git.created_files,
      ...this.danger.git.deleted_files,
      ...this.danger.git.modified_files,
    ]
  }

  run() {
    throw new Error('You have to implement the method run()!');
  }
}

module.exports = {
  Base,
}
