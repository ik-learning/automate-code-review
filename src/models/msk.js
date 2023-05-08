'use strict';
const array = require('lodash/array');

const { Base } = require('./base');
const
  { sentenceContainsValues, writeFileSync } = require("../utils");
const { mrTemplatesMsk } = require('../constants');

const exclude_csv_headers = 1;
const new_line = '\n';

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
        const before = diff.before.split(new_line).slice(1).filter((a) => a).length;
        const after = diff.after.split(new_line).slice(1).filter((a) => a).length;
        if (before > after && !sentenceContainsValues(this.mrDescription, ['## checklist', 'remove'])) {
          warn(this.#composeMsg('remove'));
        } else if (before < after && !sentenceContainsValues(this.mrDescription, ['## checklist', 'added'])) {
          warn(this.#composeMsg('add'));
        } else if (!sentenceContainsValues(this.mrDescription, ['## checklist', 'update'])) {
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
        const diffForFile = await this.danger.git.diffForFile(file);
        const after = diffForFile.after.split(new_line).slice(exclude_csv_headers).filter((a) => a); // filter to remove empty elements
        const added = diffForFile.added.split(new_line).filter((a) => a);
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
        const justDiff = diffForFile.diff.split(new_line).filter(a => a.substring(0, 1) !== '-').map(a => {
          return a.replace(' ', '').replace('+', '')
        });
        let sortedArray = [...after].sort((first, next) => {
          let el = first.split(',')[0];
          let nextEl = next.split(',')[0];
          if (el < nextEl) return -1;
          if (el > nextEl) return 1;
          return 0;
        });
        const result = [];
        const addedAsTxt = added.join(',');
        for (let i = 0; i < after.length; i++) {
          let original = after[i];
          if (addedAsTxt.includes(original) && original !== sortedArray[i]) {
            result.push(`+ ${i + 1} ${after[i]}`);
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

