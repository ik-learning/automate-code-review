'use strict';

class Base {
  #repository;
  #updatedFiles;

  constructor(danger) {
    this.danger = danger
    this.prId = danger.gitlab.metadata.pullRequestID;
    this.mrDescription = danger.gitlab.mr.description.toLowerCase()
    this.#repository = null;
    this.#updatedFiles = null;
    this._committedFiles = null;
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
  /* c8 ignore next 3 */
  run() {
    throw new Error('You have to implement the method run()!');
  }
}

module.exports = {
  Base,
}
