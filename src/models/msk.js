'use strict';

const { Base } = require('./base');
const
  { sentenceContainsValues } = require("../utils");
const { mrTemplatesMsk } = require('../constants');

// TODO
// test
class MSK extends Base {
  async templateShouldBeEnforcedMsk()  {
    console.log('in: templateShouldBeEnforcedMsk');
    // file size increased > created
    // file size decreased > deleted
    // file size remain same > modified
    const csv = this.danger.git.fileMatch("topics.csv");
    if (csv.modified) {
      const csvModified = csv.getKeyedPaths().modified;
      csvModified.forEach(async file => {
        const diff = await this.danger.git.diffForFile(file);
        const before = diff.before.split('\n').slice(1).filter((a) => a).length;
        const after = diff.after.split('\n').slice(1).filter((a) => a).length;
        let action = null;
        if (before > after && !sentenceContainsValues(this.danger.gitlab.mr.description, ['## checklist', 'remove'])) {
          action = 'remove'
        } else if (before < after && !sentenceContainsValues(this.danger.gitlab.mr.description, ['## checklist', 'added'])) {
          action = 'add'
        } else if (before == after && !sentenceContainsValues(this.danger.gitlab.mr.description, ['## checklist', 'update'])) {
          action = 'update'
        }
        if (action) {
          const template = mrTemplatesMsk[action];
          const templateWithoutExt = template.split('.')[0];
          const sanitized = template.split(" ").join("%20");
          const link = `https://gitlab.com/${this.repo}/-/blob/master/.gitlab/merge_request_templates/${sanitized}`;
          warn(`MR template is missing ***Edit>Description>Choose Template*** [${templateWithoutExt}](${link}), provide details and a jira ticket...`);
        }
      });
    }
    message(`❗ For consistency, the team should decide which convention you want to go with e.g. \`-\` or \`_\`.`)
  }

  async run() {
    await this.templateShouldBeEnforcedMsk();
  }
}

module.exports = {
  MSK,
}

