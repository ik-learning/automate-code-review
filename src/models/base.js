'use strict';

const { Results } = require('./results');

class Base {
  constructor(danger) {
    this.danger = danger
    this.result = new Results();
    this.repository = null;
    this.committedfiles = null;
  }
  danger() {
    console.log(this.danger.git);
  }
  git() {
    console.log(this.danger.git);
  }

  get repo() {
    if (!this.repository) {
      this.repository = this.danger.gitlab.metadata.repoSlug.toLowerCase();
    }
    return this.repository;
  }
  
  get committedFiles() {
    if (!this.committedfiles) {
      this.committedfiles = [
        ...this.danger.git.created_files,
        ...this.danger.git.deleted_files,
        ...this.danger.git.modified_files,
      ]
    }
    return this.committedfiles;
  }

  // to review
  addWarn(msg) {
    this.result.addWarn(msg)
  }
  addMsg(msg) {
    this.result.addMsg(msg)
  }
  //

  run() {
    throw new Error('You have to implement the method run()!');
  }
}

module.exports = {
  Base,
}
