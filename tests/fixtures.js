
const fs = require('fs');
const chainsmoker = require('../node_modules/danger/distribution/commands/utils/chainsmoker.js')

/**
 * Synchronously reads the entire contents of a file.
 * @param {*} filePath
 * @returns
 */
function setUpTestScenario(filePath) {
  return fs.readFileSync(__dirname + "/" + filePath, "utf8");
}

/**
 * Wraper method for danger.fileMatch
 * @param {*} keyedPaths
 * @returns
 */
function dangerFileMatch(keyedPaths) {
  if (keyedPaths) {
    return chainsmoker.default(keyedPaths)
  }
  return chainsmoker.default({ modified: [], created: [], deleted: [] })
}

/**
 * Synchronously reads the entire contents of a file.
 * @param {*} filePath
 * @returns
 */
function setUpTestScenarioObject(filePath) {
  const fullPath = `${__dirname}/${filePath}`
  if (fs.existsSync(fullPath)) return JSON.parse(fs.readFileSync(fullPath, "utf8"));
  console.error('File not found: ' + fullPath);
  throw new Error('File not found: ' + fullPath);
}

function cleanUp(done) {
  done();
}

module.exports = {
  setUpTestScenario,
  setUpTestScenarioObject,
  dangerFileMatch,
};
