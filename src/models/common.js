'use strict';

const { links } = require('../constants');

const { Base } = require('./base');

class Common extends Base {

  reviewLargePR() {
    console.log('in: reviewLargePR');
    const filesThreshold = 10;
    if (this.danger.gitlab.mr.changes_count > filesThreshold) {
      fail(`:warning: Pull Request size seems relatively large. Please consider breaking it up into smaller chunks... Gitlab API rate limiting throttle 'review-bot' on large MRs.`);
    }
  }

  jiraStoryMissing() {
    console.log('in: jiraStoryMissing');
    if (this.danger.gitlab.mr.state === 'opened') {
      const isJira = (this.danger.gitlab.mr.title + this.danger.gitlab.mr.description).includes("hbidigital.atlassian.net/browse")
      const isCloses = this.danger.gitlab.mr.description.includes("Closes")
      if (!isJira && !isCloses) {
        warn('Make sure there is a link provided to the relevant Jira story.')
      }
    }
  }

  async ensureFileHasNewline() {
    console.log('in: ensureHasNewLine');
    this.updatedFiles.forEach(file => {
      this.danger.git.diffForFile(file).then((el) => {
        if ((el.added + el.diff).includes('No newline at end of file') && !el.removed.includes('No newline at')) {
          warn(`📂 ***${file}***. ➡️  No newline at end of file.`);
        }
      })
    });
  }

  mrInfoCheck() {
    if (this.danger.gitlab.mr.description.length < 20) {
      warn("This MR needs a sufficiently accurate description.");
    }

    if (this.danger.gitlab.mr.title.toLocaleUpperCase().includes("WIP")) {
      warn(
        "If you want merge this MR, it's required to rename WIP part to something else."
      );
    }
  }

  welcomeMsg(input) {
    console.log('in: welcomeMsg');
    let msg = "👋 Hey there! Thank you for contributing an MR to a repo! 🎉. I'm an experimental MR review 🤖 bot."
    if (input && typeof input.url !== 'undefined') {
      let out = [
        msg + "<br>",
        `- you can find me [here](${input.url})<br>`,
        `- [suggest new MR check, share feedback and etc](${links.newIssue})`,
      ].join("\n")
      markdown(out)
    } else {
      markdown(msg)
    }
  }

  async addLabels(input) {
    console.log('in: addLabels');
    const mrLabels = this.danger.gitlab.mr.labels
    const changes = [...mrLabels, ...input.filter(el => !mrLabels.includes(el, 0))];
    if (mrLabels.length < changes.length) {
      const mr = await this.danger.gitlab.api.MergeRequests.edit(this.repo, this.prId, { labels: [...mrLabels, ...input] })
      console.log(`updated labels '${changes}' for mr '${this.prId}'`)
    }
  }

  async run() {
    this.mrInfoCheck();
    this.reviewLargePR();
    this.jiraStoryMissing();
    await this.ensureFileHasNewline();
  }
}

module.exports = {
  Common,
}
