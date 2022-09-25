'use strict';

const { danger, warn, message, markdown, results } = require('danger');

const { commonChecks, infraChecks, csvEntryAlphabeticOrderAsync } = require("/danger/lib/dangerfile.paas");

commonChecks()
infraChecks().then(r => console.log(r))
csvEntryAlphabeticOrderAsync().then();
