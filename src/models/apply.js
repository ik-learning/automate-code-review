'use strict';

const { Base } = require('./base');
const
  { filesMatchPath } = require("../utils");

class Apply extends Base {

  async addManualApplyMsg() {
    console.log('in: addManualApplyMessage');
    const result = filesMatchPath(this.committedFiles, ['terraform', '.gitlab-ci.yml', 'ci.yml', 'environments'])
    if (result.length) {
      message("🔰  You'll need to run the manual apply job when changes merged...")
    }
  }

  async addPaasManualApplyMsg() {
    console.log('in: addPaasManualApplyMsg');
    message("🔰  PaaS need to merge and apply changes...");
  }
}

module.exports = {
  Apply,
}
