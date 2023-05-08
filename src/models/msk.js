'use strict';

const { Base } = require('./base');
const
  { sentenceContainsValues } = require("../utils");
const { mrTemplatesMsk } = require('../constants');

class MSK extends Base {

  /**
   * To enforce MSK template for create, update and remove a topic
   */
  async templateShouldBeEnforcedMsk()  {
    console.log('in: templateShouldBeEnforcedMsk');
    const csv = this.danger.git.fileMatch("topics.csv");
    if (csv.modified) {
      const csvModified = csv.getKeyedPaths().modified;
      csvModified.forEach(async file => {
        const diff = await this.danger.git.diffForFile(file);
        const before = diff.before.split('\n').slice(1).filter((a) => a).length;
        const after = diff.after.split('\n').slice(1).filter((a) => a).length;
        if (before > after && !sentenceContainsValues(this.danger.gitlab.mr.description, ['## checklist', 'remove'])) {
          warn(this.#composeMsg('remove'));
        } else if (before < after && !sentenceContainsValues(this.danger.gitlab.mr.description, ['## checklist', 'added'])) {
          warn(this.#composeMsg('add'));
        } else if (!sentenceContainsValues(this.danger.gitlab.mr.description, ['## checklist', 'update'])) {
          warn(this.#composeMsg('update'));
        }
      });
      message(`❗ For consistency, the team should decide which convention you want to go with e.g. \`-\` or \`_\`.`)
    }
  }

  #composeMsg(action) {
    const template = mrTemplatesMsk[action];
    const templateWithoutExt = template.split('.')[0];
    const sanitized = template.split(" ").join("%20");
    const link = `https://gitlab.com/${this.repo}/-/blob/master/.gitlab/merge_request_templates/${sanitized}`;
    return `MR template is missing ***Edit>Description>Choose Template*** [${templateWithoutExt}](${link}), provide details and a jira ticket...`
  }

  async run() {
    await this.templateShouldBeEnforcedMsk();
  }
}

module.exports = {
  MSK,
}

