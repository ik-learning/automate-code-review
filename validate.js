'use strict';

// Validate WebHook payload
import files from 'fs';

console.log("=================Validate WebHook payload====================");

const webhookPayload = files.readFileSync(process.env.TRIGGER_PAYLOAD);
const { changes  } = JSON.parse(webhookPayload);

if ('description' in changes) {
  console.log('SKIP Validation');
  console.log('REASON: description updated');
  console.log(JSON.stringify({ result: "false" }));
  console.log("===================================");
  process.exit(1);
}
console.log("===================================");
console.log(JSON.stringify({ result: "true" }));
