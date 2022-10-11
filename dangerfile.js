'use strict';
// Example dangerfile. Every repo could contain this file in order to benefit from automated MR review
const { danger, warn, message, markdown, results } = require('danger');
const { commonChecks, infraChecks, csvEntryAlphabeticOrderAsync, addLabels } = require(
  process.env.IS_CI ? "/danger/lib/dangerfile.paas" : "./lib/dangerfile.paas"
);

console.log('in dangerfile');
// (async function () {
//   commonChecks();
//   await infraChecks();
//   await csvEntryAlphabeticOrderAsync();
// })();

// (async function () {
//   await addLabels(['danger-bot']);
// })();
