'use strict';

const { Base } = require('./base');

const
  { writeFileSync } = require("../utils");

// TODO
// tests
class Changelog extends Base {

  async changelogNotPresent() {
    console.log('in: changelogNotPresent');
    const chg = this.danger.git.fileMatch("CHANGELOG.md");
    if (chg.modified) {
      // do nothing. changelog modified
      return;
    } else if (this.committedFiles.length > 1) {
      warn('This PR modifies multiple files. Please add a changelog entry to a CHANGELOG.md noting your changes.');
    } else if (this.committedFiles.length == 1) {
      warn('This PR modifies single file. Is this changes worthy of the CHANGELOG update noting your changes?');
    }
  }

  async changelogUnreleased() {
    console.log('in: changelogUnreleased');
    const chg = this.danger.git.fileMatch("CHANGELOG.md");
    const isForReview = this.committedFiles.length > 1;

    if (chg.modified && isForReview) {
      const chgModified = chg.getKeyedPaths().modified;
      const diffInFile = await this.danger.git.diffForFile(chgModified.shift());
      const chgActionsAdded = ["+### Added", "+### Changed", "+### Fixed", "+### Removed"];
      const chgActions = ["### Added", "### Changed", "### Fixed", "### Removed"];
      let actions = 0;

      // merge them two
      for (const action in chgActionsAdded) {
        if (diffInFile.diff.includes(chgActionsAdded[action])) {
          actions += 1;
        }
      }

      if (actions === 0) {
        const firstDiff = diffInFile.diff.split('+-')[0]
        for (let action in chgActions) {
          if (firstDiff.includes(chgActions[action])) {
            actions += 1;
          }
        }
      }

      if (actions === 1) {
        message('🤖 Well done!!! Found modified CHANGELOG 🎖🎖🎖.')
      } else if (actions > 1) {
        warn('🌶  Where possible keep a release small.');
      }
    } else {
      warn('➕  Could you add an entry to the "Unreleased" section of the changelog. Valid entries are `Added|Changed|Fixed|Removed`.');
    }
  }

  async chartYamlVersionReleased() {
    console.log('in: chartYamlVersionReleased');
    message('🤖 On release, make sure chart `version` is updated in `Chart.yaml` file.');
  }

  async run() {
    await this.changelogNotPresent();
    await this.changelogUnreleased();
    await this.chartYamlVersionReleased();
  }
}

module.exports = {
  Changelog,
}
