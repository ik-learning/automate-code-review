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

  it("should not messages when validateElasticCacheRDSInstanceClassExist() and not a single file modified", () => {
    dm.danger.git.fileMatch = dangerFileMatch();
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
    dm.danger.git.fileMatch = dangerFileMatch(keyedPaths);
    target.validateInstanceClassExist()
    expect(dm.message).toHaveBeenCalledTimes(1);
    expect(dm.message).toHaveBeenCalledWith(expect.stringContaining(msg));
  });

  it.each([
    [{ modified: [], created: ['elasticache/prod/values.tfvars'], deleted: [] }],
    [{ modified: ['elasticache/prod/values.tfvars'], created: [], deleted: [] }],
    [{ modified: [], created: [], deleted: [] }],
  ])("should not messages when removeStorageResources() and not a single stack deleted", (keyedPaths) => {
    dm.danger.git.fileMatch = dangerFileMatch(keyedPaths);
    target.removeStorageResources()
    expect(dm.message).toHaveBeenCalledTimes(0);
  })

  it.each([
    [{ modified: ['elasticache/dev/values.tfvars'], deleted: ['dynamodb/**/*.tfvars'] }],
    [{ deleted: ['dynamodb/dev/values.tfvars'] }],
    [{ deleted: ['dynamodb/environments/dev/values.tfvars'] }],
    [{ deleted: ['elasticache/stack/environments/dev/values.tfvars'] }],
    [{ deleted: ['rds/stack/dev/values.tfvars'] }],
    [{ deleted: ['elasticsearch/stack/dev/values.tfvars'] }],
    [{ deleted: ['rds-aurora/stack/dev/values.tfvars'] }],
  ])('should messages when validateElasticCacheRDSInstanceClassExist() and at least a single stack is deleted', (keyedPaths) => {
    dm.danger.git.fileMatch = dangerFileMatch(keyedPaths);
    target.removeStorageResources()
    expect(dm.message).toHaveBeenCalledTimes(2);
    expect(dm.message).toHaveBeenCalledWith(expect.stringContaining('add [skip ci]'));
  });
})
