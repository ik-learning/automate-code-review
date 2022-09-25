'use strict';
// Example dangerfile
const { danger, warn, message, markdown, results } = require('danger');

if (process.env.IS_CI) {
  const { commonChecks, infraChecks, csvEntryAlphabeticOrderAsync } = require("/danger/lib/dangerfile.paas");
} else {
  const { commonChecks, infraChecks, csvEntryAlphabeticOrderAsync } = require("./lib/dangerfile.paas");
}


// commonChecks()
// infraChecks().then(r => console.log(r))
// csvEntryAlphabeticOrderAsync().then();

console.log(danger.gitlab.api.Labels.get)
