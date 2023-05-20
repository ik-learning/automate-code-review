'use strict';
// Validate WebHook payload and whether or not we should run MR review

const files = require('fs');
const { WebHookValidator } = require('./src/validate');

console.log("=================VERSIONS====================");
console.log(`build version: ${process.env.BUILD_VERSION}`);
console.log(`beta version: ${process.env.BETA_VERSION}`);

console.log("=================Validate WebHook payload====================");
const webhookPayload = files.readFileSync(process.env.TRIGGER_PAYLOAD);
const target = new WebHookValidator(webhookPayload);

const exitWithReason = (reason) => {
  console.log('SKIP Code Review');
  console.log(`REASON: ${reason}`);
  console.log(target.toString())
  console.log("================validate.js FALSE==================");
  console.log("=================ABORT=================");
  process.exit(1);
}

if (target.isNotAMergeRequest()) {
  exitWithReason(`object_kind is ${target.object_kind} and event_type is ${target.event_type}`)
}

if (target.isBot()) {
  exitWithReason("BOT detected")
}

if (target.isOnlyDescriptionUpdated()) {
  exitWithReason('only description updated')
}
console.log("================validate.js OK==================");
