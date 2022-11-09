'use strict';
// Single dangerfile. Support Multiple repositories.
const { danger, message, warn, fail, markdow } = require('danger');
const { commonChecks, infraChecks, skipReview,
  csvEntryAlphabeticOrder, templateShouldBeEnforcedMsk,
  addManualApplyMessage, links, k8sDeploy,
  addLabels, welcomeMsg, changelogs } = require(
    process.env.IS_CI ? "/danger/lib/dangerfile.paas" : "./lib/dangerfile.paas"
  );

const repoSlug = danger.gitlab.metadata.repoSlug.toLowerCase();

const contains = (repository, repoInAList) => {
  return repoInAList.some(element => {
    if (repository.includes(element)) {
      return true;
    }
    return false;
  });
}

// if (!skipReview()) {
commonChecks();

if (contains(repoSlug, ['platform-as-a-service/kafka/msk-topics'])) {
  console.log(`MR "${danger.gitlab.mr.web_url}" review..`);
  addManualApplyMessage();
  (async function () {
    await templateShouldBeEnforcedMsk();
    await csvEntryAlphabeticOrder();
  })();
}

if (contains(repoSlug, ['platform-as-a-service/infrastructure'])) {
  console.log(`MR "${danger.gitlab.mr.web_url}" review..`);
  (async function () {
    await infraChecks();
  })();
}

if (contains(repoSlug, ['k8s-deploy', 'k8s-cluster-config'])) {
  console.log(`MR "${danger.gitlab.mr.web_url}" review..`);
  (async function () {
    await changelogs();
  })();
}

if (contains(repoSlug, ['k8s-deploy'])) {
  console.log(`MR "${danger.gitlab.mr.web_url}" review..`);
  k8sDeploy();
}

if (process.env.IS_CI) {
  welcomeMsg({ url: process.env.CI_JOB_URL });
  (async function () {
    await addLabels(['review-bot']);
  })();
}
// }
