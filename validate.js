'use strict';

// Validate WebHook payload

// TODO
// test
// move logic form bash
import files from 'fs';

console.log("=================Versions====================");
console.log(`build version: ${process.env.BUILD_VERSION}`);
console.log(`beta version: ${process.env.BETA_VERSION}`);

console.log("=================Validate WebHook payload====================");

const webhookPayload = files.readFileSync(process.env.TRIGGER_PAYLOAD);
const { changes, user, object_kind, event_type  } = JSON.parse(webhookPayload);

const isBot = (user === null || user !== null && user.username.includes('bot'))

const exitWithReason = (reason) => {
  console.log('SKIP Code Review');
  console.log(`REASON: ${reason}`);
  console.log("================validate.js FALSE==================");
  console.log("=================ABORT=================");
  process.exit(1);
}

if (object_kind !== 'merge_request' && event_type !== 'merge_request') {
  console.log('SKIP Code Review');
  console.log(`REASON: object_kind is ${object_kind} and event_type is ${event_type}`);
}

if (isBot) {
  console.log('SKIP Code Review');
  console.log('REASON: BOT detected');
  console.log(JSON.stringify(JSON.parse(webhookPayload), null, 2))
}

// This check is too restrictive. Should validate where only 'description' is updated or some other areas as well.
if ('description' in changes) {
  exitWithReason('only description updated')
}
console.log("================validate.js OK==================");
