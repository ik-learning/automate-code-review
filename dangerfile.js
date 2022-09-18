'use strict';

const { danger, warn, message, markdown, results } = require('danger');

const  { commonChecks, infraChecks } = require("./dangerfile.paas");

commonChecks()
infraChecks().then(r => console.log(r))
