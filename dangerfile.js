'use strict';

const { danger, message, warn, fail, markdown } = require('danger');

const { MSK, CSV, Apply, K8S, Changelog, Common,
  Infrastructure } = require("./src/models");

let msk = new MSK(danger);
let csv = new CSV(danger);
let apply = new Apply(danger);
let k8s = new K8S(danger);
let chg = new Changelog(danger);
let infra = new Infrastructure(danger);

const repoSlug = danger.gitlab.metadata.repoSlug.toLowerCase();
const web_url = danger.gitlab.mr.web_url;

// move to utils
const contains = (repository, repoInAList) => {
  return repoInAList.some(element => {
    if (repository.includes(element)) {
      return true;
    }
    return false;
  });
}

// if (!skipReview()) {
// }

console.log(`MR "${web_url}" review..`);
let cmn = new Common(danger);
cmn.run();

if (contains(repoSlug, ['platform-as-a-service/kafka/msk-topics'])) {
  apply.addManualApplyMsg();
  (async function () {
    await msk.run();
    await csv.run();
  })();
}

if (contains(repoSlug, ['k8s-deploy', 'k8s-cluster-config'])) {
  (async function () {
    await chg.run();
  })();
}

if (contains(repoSlug, ['k8s-deploy'])) {
  k8s.k8sDeployTestsAdded();
}

if (contains(repoSlug, ['platform-as-a-service/oauth2-proxy'])) {
  apply.addPaasManualApplyMsg();
}

if (contains(repoSlug, ['platform-as-a-service/infrastructure'])) {
  apply.addManualApplyMsg();
  (async function () {
    await infra.run();
  })();
}

if (process.env.IS_CI) {
  cmn.welcomeMsg({ url: process.env.CI_JOB_URL });

  (async function () {
    await cmn.addLabels(['review-bot']);
  })();
}
