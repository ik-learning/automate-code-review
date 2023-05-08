'use strict';
const array = require('lodash/array');

const { Base } = require('./base');
const
  { sentenceContainsValues, writeFileSync } = require("../utils");
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

  /**
   * CSV entry in alphabetical order
   */
  async csvEntryAlphabeticOrder() {
    console.log('in: csvEntryAlphabeticOrder');
    const csv = this.danger.git.fileMatch("**.csv");
    if (csv.modified) {
      const csvModified = csv.getKeyedPaths().modified;
      csvModified.forEach(async file => {
        const diff = await this.danger.git.diffForFile(file);
        const after = diff.after.split('\n').slice(1).filter((a) => a); // filter to remove empty elements
        console.info(after)
        const added = diff.added.split('\n').filter((a) => a);
        // before
        // [
        //   ' fulfilment_expired_orders_v1_hbi_order_event_dlq,3,3',
        //   ' fulfilment_expired_orders_v1,3,3',
        //   ' fulfilment_new_subscriptions_v1,3,3',
        //   '-fulfilment_oms_erasures_v1,3,1',
        //   '+fulfilment_oms_erasures_v1,3,1,retention.ms=3456000000',
        //   ' fulfilment_order_count_global_temp,3,3',
        //   ' fulfilment_order_count_global_v1,3,3',
        //   ' fulfilment_routed_orders_temp,3,3'
        // ]
        // after
        // [
        //   'fulfilment_expired_orders_v1_hbi_order_event_dlq,3,3',
        //   'fulfilment_expired_orders_v1,3,3',
        //   'fulfilment_new_subscriptions_v1,3,3',
        //   'fulfilment_oms_erasures_v1,3,1,retention.ms=3456000000',
        //   'fulfilment_order_count_global_temp,3,3',
        //   'fulfilment_order_count_global_v1,3,3',
        //   'fulfilment_routed_orders_temp,3,3'
        // ]
        const justDiff = diff.diff.split('\n').filter(a => a.substring(0, 1) !== '-').map(a => {
          return a.replace(' ', '').replace('+', '')
        });
        let sorted = [...after].sort((el, nextEl) => {
          let first = el.split(',')[0];
          let second = nextEl.split(',')[0];
          if (first < second) {
            return -1;
          }
          if (first > second) {
            return 1;
          }
          return 0;
        });
        // TODO: review whole msk-topics file, as it may have few violations
        const result = [];
        let onlyAdded = true;
        let addedAsTxt = added.join(',');
        for (let i = 0; i < after.length; i++) {
          let first = after[i];
          let second = sorted[i];
          if (onlyAdded && addedAsTxt.includes(first)) {
            if (first !== second) {
              result.push(`+ ${i + 1} ${after[i]}`)
            }
          }
        }
        if (result.length) {
          let msg = [
            "We expect topics to be in alphabetical order.",
            "Topics below not following this order",
            "```diff",
            ...result,
            "```"
          ].join("\n")
          warn(msg)
        }
      }, Error())
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
    await this.csvEntryAlphabeticOrder();
  }
}

module.exports = {
  MSK,
}

