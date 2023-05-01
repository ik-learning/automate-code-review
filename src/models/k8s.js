'use strict';
const { Base } = require('./base');
// TODO
// test
class K8S extends Base {
  k8sDeployTestsAdded() {
    console.log('in: k8sDeployTestsAdded');
    message("🤖 Ensure there is an explanation how the change was tested (demo app|screenshots|other)...");
    const testsCreated = this.danger.git.fileMatch(
      "k8s/sandbox/**/*.(yml|yaml)"
    );
    const isCreated = testsCreated.getKeyedPaths().created.length == 0;
    const isModified = testsCreated.getKeyedPaths().modified.length == 0;
    const isEdited = testsCreated.getKeyedPaths().edited.length == 0;
    if (isCreated && isEdited) {
      message('🤖 Is there is a relevant test in ***k8s/sandbox/FEATURE/*** folder?')
    }
  }
  run() {
    console.log(this.danger.git);
  }
}

module.exports = {
  K8S,
}
