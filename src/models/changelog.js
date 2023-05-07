'use strict';

const { Base } = require('./base');

// TODO
// tests
class Changelog extends Base {

  // TODO: test it
  async changelogPresent() {
    console.log('in: changelogPresent');
    const chg = this.danger.git.fileMatch("CHANGELOG.md");
    if (chg.modified) {
      // do nothing. changelog modified
      return;
    } else if (this.committedFiles.length > 1) {
      warn('This PR modifies multiple files. Please add a changelog entry to a CHANGELOG.md noting your changes.');
    } else if (this.committedFiles.length == 1) {
      message('This PR modifies single file. Is this changes worthy of the CHANGELOG update noting your changes?');
    }
  }

  async changelogUnreleased() {
    console.log('in: changelogUnreleased');
    const chg = this.danger.git.fileMatch("CHANGELOG.md");
    const isForReview = this.danger.git.modified_files.length > 1;
    if (chg.modified && isForReview) {
      const chgModified = chg.getKeyedPaths().modified;
      const diffInFile = await this.danger.git.diffForFile(chgModified[0]);
      let changes = diffInFile.diff.split('\n').filter(a => a.replaceAll(/\s/g, '') !== '');
      // console.debug("\t\tchangelog: ", changes);
      // example
      // [
      //   ' ## [Unreleased]',
      //   '+### Added',
      //   '+- Simplify command. Added `k8s-deploy` alongside `/usr/local/bin/docker-entrypoint.sh`',
      //   ' ---'
      // ]
      // Unreleased > Added|Changed|Fixed|Removed >
      let firstEl = changes[0];
      let secondEl = changes[1];
      let changelogActions = ["Added", "Changed", "Fixed", "Removed"];
      if (changes.length > 1 && firstEl.includes('[Unreleased]') && ["Added", "Changed", "Fixed", "Removed"].some(el => secondEl.includes(el))) {
        message('🤖 Well done!!! Found modified CHANGELOG 🎖🎖🎖.')
      } else if (changelogActions.some(el => diffInFile.diff.includes(el))) {
        if (changelogActions.some(el => firstEl.includes(el) || secondEl.includes(el))) {

        } else {
          warn('🌶  There should be no version until it is released, that is what the `[Unreleased]` section is for.');
        }
      } else {
        warn('➕  Could you add an entry to the "Unreleased" section of the changelog. Valid entries are `Added|Changed|Fixed|Removed`.');
      }
    }
  }

  async chartYamlVersionReleased() {
    console.log('in: chartYamlVersionReleased');
    message('🤖 On release, make sure chart `version` is updated in `Chart.yaml` file.');
  }

  async run() {
    await this.changelogPresent();
    await this.changelogUnreleased();
    await this.chartYamlVersionReleased();
  }
}

module.exports = {
  Changelog,
}
