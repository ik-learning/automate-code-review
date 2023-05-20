
const fs = require('fs');
const JSON5 = require('json5');
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
  if (filePath.includes('json5') && fs.existsSync(fullPath)) {
    return JSON5.parse(fs.readFileSync(fullPath, "utf8"));
  } else if (fs.existsSync(fullPath)) {
    return JSON.parse(fs.readFileSync(fullPath, "utf8"));
  }
  console.error('File not found: ' + fullPath);
  throw new Error('File not found: ' + filePath);
}

function setupDanger() {
  jest.mock("danger", () => jest.fn())
  var danger = require("danger");
  var dm = danger;

  global.message = (input) => dm.message(input);
  global.message = (input) => dm.message(input);
  global.warn = (input) => dm.warn(input);
  global.fail = (input) => dm.fail(input);
  global.markdown = (input) => dm.markdown(input);

  dm = {
    message: jest.fn(),
    warn: jest.fn(),
    fail: jest.fn(),
    markdown: jest.fn(),

    danger: {
      git: {
        fileMatch: dangerFileMatch({ modified: [], created: [], deleted: [], edited: [] }),
        diffForFile: jest.fn(),
        created_files: [],
        deleted_files: [],
        modified_files: [],
      },
      gitlab: {
        api: {
          MergeRequests: {
            edit: jest.fn(),
          }
        },
        metadata: {
          pullRequestID: jest.fn()
        },
        mr: {
          description: '',
          state: '',
          title: '',
        },
        approvals: {}
      },
    },
  }
  return dm;
}

function cleanUp(done) {
  done();
}

module.exports = {
  setUpTestScenario,
  setUpTestScenarioObject,
  dangerFileMatch,
  setupDanger,
};
