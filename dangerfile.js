'use strict';
// Example dangerfile
const { danger, warn, message, markdown, results } = require('danger');
const { commonChecks, infraChecks, csvEntryAlphabeticOrderAsync, addLabels } = require(
  process.env.IS_CI ? "/danger/lib/dangerfile.paas" : "./lib/dangerfile.paas"
);

(async function () {
  commonChecks();
  await infraChecks();
  await csvEntryAlphabeticOrderAsync();
})();

(async function () {
  await addLabels(['danger-bot']);
})();
