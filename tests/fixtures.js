
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
  return JSON.parse(fs.readFileSync(__dirname + "/" + filePath, "utf8"));
}

function cleanUp(done) {
  done();
}

module.exports = {
  setUpTestScenario,
  setUpTestScenarioObject,
  dangerFileMatch,
};
