'use strict';
// Example dangerfile. Every repo could contain this file in order to benefit from automated MR review
const { danger, message, warn, fail, markdow } = require('danger');
const { commonChecks, infraChecks,
  csvEntryAlphabeticOrderAsync, templateShouldBeEnforcedMsk,
  addLabels, welcomeMsg } = require(
    process.env.IS_CI ? "/danger/lib/dangerfile.paas" : "./lib/dangerfile.paas"
  );

// console.log(danger.gitlab.mr);

if (danger.gitlab.metadata.repoSlug.includes('platform-as-a-service/kafka/msk-topics')) {
  console.log(`MR "${danger.gitlab.mr.web_url}" review..`);
  (async function () {
    commonChecks();
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
