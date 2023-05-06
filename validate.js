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
const { changes  } = JSON.parse(webhookPayload);

if ('description' in changes) {
  console.log('SKIP Code Review');
  console.log('REASON: description updated');
  console.log(JSON.stringify({ result: "false" }));
  console.log("=================ABORT=================");
  process.exit(1);
}
console.log("================PROCEED==================");
console.log(JSON.stringify({ result: "true" }));
