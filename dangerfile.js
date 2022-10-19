'use strict';
// Single dangerfile. Support Multiple repositories.
const { danger, message, warn, fail, markdow } = require('danger');
const { commonChecks, infraChecks, skipReview,
  csvEntryAlphabeticOrderAsync, templateShouldBeEnforcedMsk,
  addManualApplyMessage,
  addLabels, welcomeMsg } = require(
    process.env.IS_CI ? "/danger/lib/dangerfile.paas" : "./lib/dangerfile.paas"
  );

// console.log(danger.gitlab.mr);

if (!skipReview()) {
  if (danger.gitlab.metadata.repoSlug.includes('platform-as-a-service/kafka/msk-topics')) {
    console.log(`MR "${danger.gitlab.mr.web_url}" review..`);
    (async function () {
      commonChecks();
      addManualApplyMessage();
      await templateShouldBeEnforcedMsk();
      await csvEntryAlphabeticOrderAsync();
    })();
  }

  if (danger.gitlab.metadata.repoSlug.includes('platform-as-a-service/infrastructure')) {
    console.log(`MR "${danger.gitlab.mr.web_url}" review..`);
    (async function () {
      commonChecks();
      await infraChecks();
    })();
  }

  (async function () {
    welcomeMsg({ url: process.env.CI_JOB_URL });
    await addLabels(['danger-bot']);
  })();
}
