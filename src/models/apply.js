'use strict';

const { Base } = require('./base');

class Apply extends Base {

  async addManualApplyMsg() {
    console.log('in: addManualApplyMessage');
    // TODO: move to utils
    const result = this.committedFiles.filter(val => {
      return [
        'terraform', '.gitlab-ci.yml', 'ci.yml', 'environments'
      ].some(el => val.includes(el))
    });
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
