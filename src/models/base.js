'use strict';

const { Results } = require('./results');
// TODO
// test
class Base {
  constructor(danger) {
    this.danger = danger
    this.result = new Results();
    this.prId = danger.gitlab.metadata.pullRequestID;
    this._repository = null;
    this._committedFiles = null;
    this._updatedFiles = null;
  }
  danger() {
    console.log(this.danger.git);
  }
  git() {
    console.log(this.danger.git);
  }

  get repo() {
    if (!this._repository) {
      this._repository = this.danger.gitlab.metadata.repoSlug;
    }
    return this._repository;
  }

  get committedFiles() {
    if (!this._committedFiles) {
      this._committedFiles = [
        ...this.danger.git.created_files,
        ...this.danger.git.deleted_files,
        ...this.danger.git.modified_files,
      ]
    }
    return this._committedFiles;
  }

  get updatedFiles() {
    if (!this._updatedFiles) {
      this._updatedFiles = [
        ...this.danger.git.created_files,
        ...this.danger.git.modified_files,
      ]
    }
    return this._updatedFiles;
  };

  // to review
  addWarn(msg) {
    this.result.addWarn(msg)
  }
  addMsg(msg) {
    this.result.addMsg(msg)
  }
  //

  // abstract methods
  run() {
    throw new Error('You have to implement the method run()!');
  }
}

module.exports = {
  Base,
}
