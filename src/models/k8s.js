'use strict';
const { Base } = require('./base');

class K8S extends Base {

  async k8sDeployTestsAdded() {
    console.log('in: k8sDeployTestsAdded');
    message("🤖 Make sure that there is a description of how the change was tested using the demo app, including screenshots and any other relevant information....");
    const targets = this.danger.git.fileMatch(
      "k8s/sandbox/**/*.(yml|yaml)",
      "k8s/helm/**/tests/**/*.(yml|yaml)"
    );
    const isTestNotCreatedAndNotModified = targets.modified && !targets.created
      || !targets.modified && targets.created
      || targets.modified && targets.created  ? false : true;
    if (isTestNotCreatedAndNotModified) {
      message('🤖 Is there is a relevant test in `k8s/helm/hbi-deployment/tests OR k8s/sandbox/**/*` folders?')
    }
  }
}

module.exports = {
  K8S,
}
