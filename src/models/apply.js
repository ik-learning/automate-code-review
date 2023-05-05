'use strict';

const { Base } = require('./base');
// TODO
// test
class Apply extends Base {

  addManualApplyMsg() {
    console.log('in: addManualApplyMessage');
    // manual apply advice should be added to an MR
    const result = this.committedFiles.filter(val => {
      return [
        'terraform', '.gitlab-ci.yml', 'ci.yml', 'environments'
      ].some(el => val.includes(el))
    });
    if (result.length > 0) {
      message("🔰  You'll need to run the manual apply job when changes merged...")
    }
  }

  async addPaasManualApplyMsg() {
    console.log('in: addPaasManualApplyMsg');
    message("🔰  PaaS need to merge and apply changes...");
  }

  async run() {
    console.log('nothing shared');
  }
}

module.exports = {
  Apply,
}
