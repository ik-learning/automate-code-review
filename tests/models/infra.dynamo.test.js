const { Infrastructure } = require("../../src/models");
const { setUpTestScenarioObject, setUpTestScenario,
  dangerFileMatch, setupDanger } = require("../fixtures");

describe("test models/infrastructure.js ...", () => {
  let target, dm;
  const fixturesPath = "models/__fixtures__/dynamo/";

  beforeEach(() => {
    dm = setupDanger();
    target = new Infrastructure(dm.danger);
  })

  describe("validateDBCommons()", () => {

    it.each([
      [{ modified: [], created: [], deleted: [], edited: [] }, 0],
      [{ modified: [], created: ['rds/envs/dev/terragrunt.hcl'], deleted: [], edited: [] }, 0],
      [{ modified: [], created: ['dynamodb/envs/dev/terragrunt.hcl'], deleted: [], edited: [] }, 0],
    ])("should not message when dynamoDBCommonChecks() and not a single dynamodb config file modified", (keyedPaths, times) => {
      dm.danger.git.fileMatch = dangerFileMatch(keyedPaths);
      return target.validateDBCommons().then(() => {
        expect(dm.warn).toHaveBeenCalledTimes(times);
      })
    })

    it("should message when dynamoDBCommonChecks() and dynamo is created", () => {
      dm.danger.git.fileMatch = dangerFileMatch({ created: ["dynamodb/dev/eu-west-1/guest/terraform.tfvars"], modified: [] });
      dm.danger.git.diffForFile = (file) => {
        return setUpTestScenarioObject(fixturesPath + 'diffForFile/pay_per_request-created.msg.json')
      }
      return target.validateDBCommons(true).then(() => {
        expect(dm.message).toHaveBeenCalledTimes(1);
        expect(dm.message).toHaveBeenCalledWith(expect.stringContaining('The "billing_mode PAY_PER_REQUEST" is configured'));
      })
    })

    it("should message when dynamoDBCommonChecks() and dynamo is modified", () => {
      dm.danger.git.fileMatch = dangerFileMatch({ created: [], modified: ["dynamodb/prod/eu-west-1/guest/terraform.tfvars"] });
      dm.danger.git.diffForFile = (file) => {
        return setUpTestScenarioObject(fixturesPath + 'diffForFile/pay_per_request-created.msg.json')
      }
      return target.validateDBCommons(true).then(() => {
        expect(dm.message).toHaveBeenCalledTimes(1);
        expect(dm.message).toHaveBeenCalledWith(expect.stringContaining('The "billing_mode PAY_PER_REQUEST" is configured'));
      })
    })
  })

  describe("validateDBSingleKeyModification()", () => {
    it.each([
      [{ modified: [], created: [], deleted: [], edited: [] }, 0],
    ])("should not message when dynamoDBCommonChecks() and not a single dynamodb config file modified", (keyedPaths, times) => {
      dm.danger.git.fileMatch = dangerFileMatch(keyedPaths);
      return target.validateDBSingleKeyModification().then(() => {
        expect(dm.warn).toHaveBeenCalledTimes(times);
      })
    })

    it("should message when validateDBSingleKeyModification() with number of changes hit threshold", () => {
      dm.danger.git.fileMatch = dangerFileMatch(setUpTestScenarioObject(fixturesPath + 'dangerFileMatch/multiple-modifications.11.json'));
      return target.validateDBSingleKeyModification().then(() => {
        expect(dm.warn).toHaveBeenCalledTimes(1);
        expect(dm.warn).toHaveBeenCalledWith(expect.stringContaining('Skip review as number of'));
      })
    })

    it("should warn when validateDBSingleKeyModification() and 'non_key_attributes' is modified", () => {
      dm.danger.git.fileMatch = dangerFileMatch(setUpTestScenarioObject(fixturesPath + 'dangerFileMatch/multiple-modifications.1.json'));
      dm.danger.git.diffForFile = (file) => {
        return setUpTestScenarioObject(fixturesPath + 'diffForFile/non_key_attribute-modified.warn.json')
      }
      return target.validateDBSingleKeyModification().then(() => {
        expect(dm.warn).toHaveBeenCalledTimes(1);
        expect(dm.warn).toHaveBeenCalledWith(expect.stringContaining("Cannot update GSI's properties"));
        expect(dm.warn).toHaveBeenCalledWith(expect.stringContaining("Remove GCI 'site_index'"));
      })
    })

    it("should warn when validateDBSingleKeyModification() and 'range_key' is modified", () => {
      dm.danger.git.fileMatch = dangerFileMatch(setUpTestScenarioObject(fixturesPath + 'dangerFileMatch/multiple-modifications.1.json'));
      dm.danger.git.diffForFile = (file) => {
        return setUpTestScenarioObject(fixturesPath + 'diffForFile/range_key-modified.warn.json')
      }
      return target.validateDBSingleKeyModification().then(() => {
        expect(dm.warn).toHaveBeenCalledTimes(1);
        expect(dm.warn).toHaveBeenCalledWith(expect.stringContaining("Cannot update GSI's properties"));
        expect(dm.warn).toHaveBeenCalledWith(expect.stringContaining("Remove GCI 'idx_by_customer_id'"));
      })
    })

    it("should warn when validateDBSingleKeyModification() and multiple changes found while comparing 'global secondary indexes'", () => {
      dm.danger.git.fileMatch = dangerFileMatch(setUpTestScenarioObject(fixturesPath + 'dangerFileMatch/multiple-modifications.1.json'));
      dm.danger.git.diffForFile = (file) => {
        return setUpTestScenarioObject(fixturesPath + 'diffForFile/multiple-gci-modifications.warn.json')
      }
      return target.validateDBSingleKeyModification().then(() => {
        expect(dm.warn).toHaveBeenCalledTimes(1);
        expect(dm.warn).toHaveBeenCalledWith(expect.stringContaining('Only one GSI can be modified at a time'));
      })
    })

    it("should not messages when validateDBSingleKeyModification() single key modification", () => {
      dm.danger.git.fileMatch = dangerFileMatch(setUpTestScenarioObject(fixturesPath + 'dangerFileMatch/multiple-modifications.11.json'));
      return target.validateDBSingleKeyModification().then(() => {
        expect(dm.warn).toHaveBeenCalledTimes(1);
        expect(dm.warn).toHaveBeenCalledWith(expect.stringContaining('Skip review as number of'));
      })
    })

    it("should not messages when validateDBSingleKeyModification() and attributes modified", () => {
      dm.danger.git.fileMatch = dangerFileMatch({ modified: [], created: [], deleted: [], edited: [] });
      return target.validateDBSingleKeyModification().then(() => {
        expect(dm.warn).toHaveBeenCalledTimes(0);
      })
    })

  })

  it("should test paradox", () => {
    return target.run().then(() => {
      expect(dm.fail).toHaveBeenCalledTimes(0);
    })
  })
})
