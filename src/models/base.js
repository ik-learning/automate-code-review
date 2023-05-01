'use strict';

class Base {
  constructor(danger) {
    this.danger = danger
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
