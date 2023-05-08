const gitlab = require("../../node_modules/danger/distribution/platforms/GitLab.js");
const { GitDSL } = require("../../node_modules/danger/distribution/dsl/GitDSL.js");
var chainsmoker = require('../../node_modules/danger/distribution/commands/utils/chainsmoker.j')

console.info(Object.entries(this.danger.git))
console.info(Object.entries(this.danger.git))

const
  { writeFileSync } = require("../utils");
  
// console.info("---------")
// console.info(Object.entries(this.danger.git))
// console.info(diff)
// console.info("---------")
return false

writeFileSync(process.cwd() + "/tests/models/__fixtures__/msk/topics.diff.csv", JSON.stringify(diff))
console.log(this.danger.gitlab.mr)
writeFileSync(process.cwd() + "/tests/models/__fixtures__/msk/topics.add.mr", JSON.stringify(this.danger.gitlab.mr.description))

const chgModified = chg.getKeyedPaths().modified;
const diffInFile = await this.danger.git.diffForFile(chgModified.shift());
console.info(diffInFile)
let changes = diffInFile.diff.split('\n').filter(a => a.replaceAll(/\s/g, '') !== '');
console.info(changes)
writeFileSync(process.cwd() + "/tests/models/__fixtures__/changelog/changelog-diff.json", JSON.stringify(diffInFile))
