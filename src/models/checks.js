'use strict';

const { Base } = require('./base');
// TODO
// test
class Checks extends Base {

  skipReview() {
    console.log('in: skipReview');
    let result = false;
    let reviewOnce = false
    if (!this.danger.gitlab.mr.state.includes('opened')) {
      console.log(`skip MR review as "state" is "${danger.gitlab.mr.state}"`);
      return true;
    }
    if (this.danger.gitlab.approvals.approved === true) {
      console.log(`skip "approved" MR"`);
      return true;
    }
    if (this.danger.gitlab.mr.title.toLowerCase().includes("[skip ci]")) {
      console.log('skip MR review as title contains [skip ci]');
      return true;
    }
    if (!result) {
      this.danger.gitlab.mr.labels.forEach(label => {
        // || label === 'review-bot'
        if (label === 'renovate-bot') {
          console.log(`skip MR review as label 'renovate-bot' found.`);
          result = true;
        }
        if (label === 'review-bot') {
          reviewOnce = true;
        }
      });
    }
    // skip if more then 10 minutes from last commit
    if (!result && this.danger.gitlab.commits.length > 0) {
      let diff = Math.abs(new Date() - new Date(this.danger.gitlab.commits[0].created_at));
      let minutes = Math.floor((diff / 1000) / 60);
      const thresholdInMinutes = 5;
      if (minutes > thresholdInMinutes && reviewOnce) {
        console.log(`skip MR review as last commit is older then '${thresholdInMinutes}' minutes.`);
        result = true
      }
    }
    if (!result) {
      this.danger.git.commits.forEach(commit => {
        if (commit.message.includes("[skip ci]")) {
          console.log(`skip MR review as commit message contains [skip ci]`);
          result = true;
        }
      });
    }
    return result;
  }

  run() {
    console.log('not required');
  }
}

module.exports = {
  Checks,
}
