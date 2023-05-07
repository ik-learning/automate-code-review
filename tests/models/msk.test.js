
jest.mock("danger", () => jest.fn())
const chainsmoker = require('../../node_modules/danger/distribution/commands/utils/chainsmoker.js')
const danger = require("danger");
let dm = danger;

const { setUpTestScenarioObject, setUpTestScenario } = require("../fixtures");

const { MSK } = require("../../src/models");
let target;

describe("test models/msk.js ...", () => {

  beforeEach(() => {

    global.message = (input) => dm.message(input);
    global.warn = (input) => dm.warn(input);

    dm = {
      message: jest.fn(),
      warn: jest.fn(),
      danger: {
        git: {
          fileMatch: jest.fn(),
          diffForFile: jest.fn(),
        },
        gitlab: {
          metadata: {
            pullRequestID: jest.fn()
          },
          mr: {
            description: '',
          }
        },
      },
    }
    target = new MSK(dm.danger);
  })

  it("should ... when target file not modified", () => {
    dm.danger.git.fileMatch = chainsmoker.default({ modified: ['topics.csv'] });
    dm.danger.gitlab.mr.description = setUpTestScenario('models/__fixtures__/msk/added.topics.description-ok.txt')
    dm.danger.git.diffForFile = (file) => {
      return setUpTestScenarioObject('models/__fixtures__/msk/added.topics.csv.json')
    }
    return target.templateShouldBeEnforcedMsk().then(() => {
      expect(dm.message).toHaveBeenCalledTimes(1);
      expect(dm.message).toHaveBeenCalledWith(expect.stringContaining('the team should decide which'));
      // expect(dm.message).toHaveBeenCalledWith(expect.stringContaining('template is missing'));
    })
  })

  it.only("should post message on templateShouldBeEnforcedMsk", () => {
    dm.danger.git.fileMatch = chainsmoker.default({ modified: ['topics.csv'] });
    dm.danger.gitlab.mr.description = setUpTestScenario('models/__fixtures__/msk/added.topics.description-not-ok.txt')
    dm.danger.git.diffForFile = (file) => {
      return setUpTestScenarioObject('models/__fixtures__/msk/added.topics.csv.json')
    }
    return target.templateShouldBeEnforcedMsk().then(() => {
      expect(dm.message).toHaveBeenCalledTimes(1);
      expect(dm.warn).toHaveBeenCalledTimes(1);
      expect(dm.message).toHaveBeenCalledWith(expect.stringContaining('the team should decide which'));
      expect(dm.warn).toHaveBeenCalledWith(expect.stringContaining('template is missing'));
    })
  })



  it("should not post a message when templateShouldBeEnforcedMsk() in cases when target file not modified", () => {
    dm.danger.git.fileMatch = chainsmoker.default({ modified: [], created: [], deleted: [], edited: [] });
    return target.templateShouldBeEnforcedMsk().then(() => {
      expect(dm.message).toHaveBeenCalledTimes(0);
      // expect(dm.message).toHaveBeenCalledWith(expect.stringContaining('the team should decide which'));
    })
  })

})
