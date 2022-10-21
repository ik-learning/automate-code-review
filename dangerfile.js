'use strict';
// Single dangerfile. Support Multiple repositories.
const { danger, message, warn, fail, markdow } = require('danger');
const { commonChecks, infraChecks, skipReview,
  csvEntryAlphabeticOrder, templateShouldBeEnforcedMsk,
  addManualApplyMessage, links,
  addLabels, welcomeMsg } = require(
    process.env.IS_CI ? "/danger/lib/dangerfile.paas" : "./lib/dangerfile.paas"
  );

if (!skipReview()) {
  commonChecks();

  if (danger.gitlab.metadata.repoSlug.includes('platform-as-a-service/kafka/msk-topics')) {
    console.log(`MR "${danger.gitlab.mr.web_url}" review..`);
    addManualApplyMessage();
    (async function () {
      await templateShouldBeEnforcedMsk();
      await csvEntryAlphabeticOrder();
    })();
  }

  if (danger.gitlab.metadata.repoSlug.includes('platform-as-a-service/infrastructure')) {
    console.log(`MR "${danger.gitlab.mr.web_url}" review..`);
    (async function () {
      await infraChecks();
    })();
  }

  if (process.env.IS_CI) {
    welcomeMsg({ url: process.env.CI_JOB_URL });
    (async function () {
      await addLabels(['review-bot']);
    })();
  }
}
