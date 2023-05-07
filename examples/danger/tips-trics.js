const gitlab = require("../../node_modules/danger/distribution/platforms/GitLab.js");
const { GitDSL } = require("../../node_modules/danger/distribution/dsl/GitDSL.js");
var chainsmoker = require('../../node_modules/danger/distribution/commands/utils/chainsmoker.j')

console.info(Object.entries(this.danger.git))
console.info(Object.entries(this.danger.git))

// console.info("---------")
// console.info(Object.entries(this.danger.git))
// console.info(diff)
// console.info("---------")
return false

writeFileSync(process.cwd() + "/tests/models/__fixtures__/msk/topics.diff.csv", JSON.stringify(diff))
console.log(this.danger.gitlab.mr)
writeFileSync(process.cwd() + "/tests/models/__fixtures__/msk/topics.add.mr", JSON.stringify(this.danger.gitlab.mr.description))
