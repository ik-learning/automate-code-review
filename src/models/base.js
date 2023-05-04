'use strict';

const { Results } = require('./results');
// TODO
// test
class Base {
  constructor(danger) {
    this.danger = danger
    this.result = new Results();
    this.repository = null;
    this.committedfiles = null;
    this.updatedfiles = null;
    this.prId = danger.gitlab.metadata.pullRequestID;
  }
  danger() {
    console.log(this.danger.git);
  }
  git() {
    console.log(this.danger.git);
  }

  get repo() {
    if (!this.repository) {
      this.repository = this.danger.gitlab.metadata.repoSlug;
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

  get updatedFiles() {
    if (!this.updatedfiles) {
      this.updatedfiles = [
        ...this.danger.git.created_files,
        ...this.danger.git.modified_files,
      ]
    }
    return this.updatedfiles;
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
