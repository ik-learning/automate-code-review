jest.mock("danger", () => jest.fn())
const danger = require("danger");
let dm = danger;

const { setUpTestScenarioObject, setUpTestScenario, dangerFileMatch } = require("../fixtures");

const { Infrastructure } = require("../../src/models");
let target;

describe("test models/infrastructure.js ...", () => {
  beforeEach(() => {

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
          fileMatch: jest.fn(),
          diffForFile: jest.fn(),
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
          }
        },
      },
    }
    target = new Infrastructure(dm.danger);
  })

  it.each([
    [{ modified: [], created: [], deleted: [], edited: [] }, 0],
    [{ modified: [], created: ['rds/envs/dev/terragrunt.hcl'], deleted: [], edited: [] }, 0],
    [{ modified: [], created: ['dynamodb/envs/dev/terragrunt.hcl'], deleted: [], edited: [] }, 0],
  ])("should not messages when dynamoDBCommonChecks() and not a single dynamodb config file modified", (keyedPaths, times) => {
    dm.danger.git.fileMatch = dangerFileMatch(keyedPaths);
    return target.validateDBCommons().then(() => {
      expect(dm.warn).toHaveBeenCalledTimes(times);
    })
    // expect(dm.message).toHaveBeenCalledWith(expect.stringContaining('description of how the change'));
    // expect(dm.message).toHaveBeenCalledWith(expect.stringContaining('is a relevant test in'));
  })

  it.each([
    [{ modified: [], created: [], deleted: [], edited: [] }, 0],
  ])("should not messages when dynamoDBCommonChecks() and not a single dynamodb config file modified", (keyedPaths, times) => {
    dm.danger.git.fileMatch = dangerFileMatch(keyedPaths);
    return target.validateDBSingleKeyModification().then(() => {
      expect(dm.warn).toHaveBeenCalledTimes(times);
    })
    // expect(dm.message).toHaveBeenCalledWith(expect.stringContaining('description of how the change'));
    // expect(dm.message).toHaveBeenCalledWith(expect.stringContaining('is a relevant test in'));
  })
})
