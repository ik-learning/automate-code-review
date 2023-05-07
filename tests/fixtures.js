
const fs = require('fs');

/**
 * Synchronously reads the entire contents of a file.
 * @param {*} filePath
 * @returns
 */
function setUpTestScenario(filePath) {
  return fs.readFileSync(__dirname + "/" + filePath, "utf8");
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
};
