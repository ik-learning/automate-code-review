'use strict';

class Base {
  #repository;
  #updatedFiles;

  constructor(danger) {
    this.danger = danger
    this.prId = danger.gitlab.metadata.pullRequestID;
    this.#repository = null;
    this.#updatedFiles = null;
    this._committedFiles = null;
  }
  danger() {
    console.log(this.danger.git);
  }
  git() {
    console.log(this.danger.git);
  }

  get repo() {
    if (!this.#repository) {
      this.#repository = this.danger.gitlab.metadata.repoSlug;
    }
    return this.#repository;
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
    if (!this.#updatedFiles) {
      this.#updatedFiles = [
        ...this.danger.git.created_files,
        ...this.danger.git.modified_files,
      ]
    }
    return this.#updatedFiles;
  };

  // abstract methods
  run() {
    throw new Error('You have to implement the method run()!');
  }
}

module.exports = {
  Base,
}
