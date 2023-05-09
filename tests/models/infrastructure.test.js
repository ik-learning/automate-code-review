jest.mock("danger", () => jest.fn())
const chainsmoker = require('../../node_modules/danger/distribution/commands/utils/chainsmoker.js')
const danger = require("danger");
let dm = danger;

const { setUpTestScenarioObject, setUpTestScenario } = require("../fixtures");

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

  it("should not messages when validateElasticCacheRDSInstanceClassExist() and not a single file modified", () => {
    dm.danger.git.fileMatch = chainsmoker.default({ modified: [], created: [], deleted: [], edited: [] });
    target.validateInstanceClassExist()
    expect(dm.message).toHaveBeenCalledTimes(0);
  })


  it.each([
    [{ modified: ['elasticache/dev/values.tfvars'], created: [] }, 'cache node types'],
    [{ modified: [], edited: ['elasticache/stage/values.tfvars'], created: [] }, 'cache node types'],
    [{ modified: [], edited: [], created: ['elasticache/prod/values.tfvars'] }, 'cache node types'],
    [{ modified: [], edited: [], created: ['rds/prod/values.tfvars'] }, '[rds instance classes]'],
    [{ modified: ['rds/stage/values.tfvars'], edited: [], created: [] }, '[rds instance classes]'],
    [{ modified: [], edited: ['rds/stage/values.tfvars'], created: [] }, '[rds instance classes]'],
  ])('should messages when validateElasticCacheRDSInstanceClassExist() and at least a single file is modified', (keyedPaths, msg) => {
    dm.danger.git.fileMatch = chainsmoker.default(keyedPaths);
    target.validateInstanceClassExist()
    expect(dm.message).toHaveBeenCalledTimes(1);
    expect(dm.message).toHaveBeenCalledWith(expect.stringContaining(msg));
  });
})
