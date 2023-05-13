const { Infrastructure } = require("../../src/models");
const { setUpTestScenarioObject, setUpTestScenario,
  dangerFileMatch, setupDanger } = require("../fixtures");

describe("test models/infrastructure.js ...", () => {
  let target, dm;

  beforeEach(() => {
    dm = setupDanger();
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
  })

  it.each([
    [{ modified: [], created: [], deleted: [], edited: [] }, 0],
  ])("should not messages when dynamoDBCommonChecks() and not a single dynamodb config file modified", (keyedPaths, times) => {
    dm.danger.git.fileMatch = dangerFileMatch(keyedPaths);
    return target.validateDBSingleKeyModification().then(() => {
      expect(dm.warn).toHaveBeenCalledTimes(times);
    })
  })

  it("should messages when validateDBSingleKeyModification() with stack hit threshold", () => {
    dm.danger.git.fileMatch = dangerFileMatch(setUpTestScenarioObject('models/__fixtures__/dynamo/multiple-modifications.bad.json'));
    return target.validateDBSingleKeyModification().then(() => {
      expect(dm.warn).toHaveBeenCalledTimes(1);
      expect(dm.warn).toHaveBeenCalledWith(expect.stringContaining('Skip review as number of'));
    })
  })
})
