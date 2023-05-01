'use strict';
const array = require('lodash/array');

const { Base } = require('./base');

// TODO
// test
class CSV extends Base {
  async csvEntryAlphabeticOrder() {
    console.log('in: csvEntryAlphabeticOrder');
    const csv = this.danger.git.fileMatch("**.csv");
    if (csv.modified) {
      const csvModified = csv.getKeyedPaths().modified;
      csvModified.forEach(async file => {
        const diff = await this.danger.git.diffForFile(file);
        const before = diff.before.split('\n').slice(1).filter((a) => a);
        const after = diff.after.split('\n').slice(1).filter((a) => a); // filter to remove empty elements
        const added = array.xor(before, after);
        let sorted = [...after].sort((a, b) => {
          let first = a.split(',')[0];
          let second = b.split(',')[0];
          if (first < second) {
            return -1;
          }
          if (first > second) {
            return 1;
          }
          return 0;
        });
        // TODO: review whole msk-topics file, as it does have multiple violations
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
        if (result.length > 0) {
          // console.log(result)
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
  async run() {
    await this.csvEntryAlphabeticOrder();
  }
}

module.exports = {
  CSV,
}
