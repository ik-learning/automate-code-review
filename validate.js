'use strict';

// Validate WebHook payload
import files from 'fs';

console.log("=================Validate WebHook payload====================");

const webhookPayload = files.readFileSync(process.env.TRIGGER_PAYLOAD);
const { changes  } = JSON.parse(webhookPayload);

console.log(changes)
console.log("=====================================");
console.log(JSON.stringify({ result: "true" }));
