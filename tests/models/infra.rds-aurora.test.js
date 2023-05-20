const { Infrastructure } = require("../../src/models");
const { setUpTestScenarioObject, setUpTestScenario, dangerFileMatch, setupDanger } = require("../fixtures");

describe("test models/infrastructure.js ...", () => {
  let target, dm;
  const fixturesPath = "models/__fixtures__/rds-aurora/";

  beforeEach(() => {
    dm = setupDanger();
    target = new Infrastructure(dm.danger);
  })

  describe("validateRdsAuroraCommons()", () => {
    it.each([
      ['mixed.warn.json5', 1],
      ['modified.warn.json5', 1],
      ['created.ok.json', 0],
    ])("should warn when validateRdsCommons() and the review should be skipped", (scenario, times) => {
      dm.danger.git.fileMatch = dangerFileMatch(setUpTestScenarioObject(`${fixturesPath}/fileMatch/${scenario}`));
      target.validateRdsAuroraCommons()
      expect(dm.warn).toHaveBeenCalledTimes(times);
      if (times > 0) expect(dm.warn).toHaveBeenCalledWith(expect.stringContaining('Multiple configurations modified in single MR'));
    })

    it.each([
      ['created.threshold.json5', 1],
      ['modified.threshold.json5', 1],
      ['deleted.threshold.json5', 1],
      ['created.ok.json', 0],
    ])("should warn when ensureRdsCreationValidated() number of stacks hits the threshold", (scenario, times) => {
      dm.danger.git.fileMatch = dangerFileMatch(setUpTestScenarioObject(`${fixturesPath}/fileMatch/${scenario}`));
      target.validateRdsAuroraCommons()
      expect(dm.warn).toHaveBeenCalledTimes(times);
      if (times > 0) expect(dm.warn).toHaveBeenCalledWith(expect.stringContaining('Skip review as number of'));
    })
  })

  describe("validateRdsAuroraCreation()", () => {

    it.each([
      [{ modified: [], created: ["rds-aurora/dev/lighthouse/terraform.tfvars"], deleted: [], edited: [] }, 0],
      [{
        created: ["rds-aurora/dev/lighthouse/terraform.tfvars", "rds-aurora/dev/guests/terraform.tfvars",
          "rds-aurora/dev/payrol/terraform.tfvars"]
      }, 0],
      [{ modified: ["rds-aurora/environments/prod/lighthouse/terraform.tfvars"], created: [], deleted: [], edited: [] }, 0],
      [{ modified: ["rds-aurora/environments/prod/lighthouse/terraform.tfvars"], created: [], deleted: [], edited: [] }, 0]
    ])("should warn when validateRdsAuroraCreation() with conditions", (scenario, times) => {
      dm.danger.git.fileMatch = dangerFileMatch(scenario);
      dm.danger.git.diffForFile = (file) => {
        return setUpTestScenarioObject(`${fixturesPath}/diffForFile/rds-create.ok.json5`)
      }
      return target.validateRdsAuroraCreation().then(() => {
        expect(dm.warn).toHaveBeenCalledTimes(times);
      })
    })

    it("should warn when validateRdsAuroraCreation() with conditions", () => {
      dm.danger.git.fileMatch = dangerFileMatch({ created: ["rds-aurora/dev/lighthouse/tf.tfvars"] });
      dm.danger.git.diffForFile = (file) => {
        return setUpTestScenarioObject(`${fixturesPath}/diffForFile/rds-create.warn.json5`)
      }
      return target.validateRdsAuroraCreation().then(() => {
        expect(dm.warn).toHaveBeenCalledTimes(1);
      })
    })
  })

  describe("validateRdsAuroraModification()", () => {

    it.each([
      [{ modified: ["rds-aurora/environments/dev/lighthouse/terraform.tfvars"], created: [], deleted: [], edited: [] }, 1],
      [{ modified: ["rds-aurora/environments/sandbox/lighthouse/terraform.tfvars"], created: [], deleted: [], edited: [] }, 1],
      [{ modified: ["rds-aurora/environments/prod/lighthouse/terraform.tfvars"], created: [], deleted: [], edited: [] }, 0],
      [{ modified: [], created: ["rds-aurora/environments/prod/lighthouse/terraform.tfvars"], deleted: [], edited: [] }, 0]
    ])("should warn when validateRdsAuroraModification() with certain conditions", (scenario, times) => {
      dm.danger.git.fileMatch = dangerFileMatch(scenario);
      dm.danger.git.diffForFile = (file) => {
        return setUpTestScenarioObject(`${fixturesPath}/diffForFile/version-modified.warn.json5`)
      }
      return target.validateRdsAuroraModification().then(() => {
        expect(dm.warn).toHaveBeenCalledTimes(times);
        if (times > 0) expect(dm.warn).toHaveBeenCalledWith(expect.stringContaining('non-production environment "instance_type"'));
      })
    })

    it("should silent when validateRdsAuroraModification() and no issues found", () => {
      dm.danger.git.fileMatch = dangerFileMatch({ modified: ["rds-aurora/environments/dev/lighthouse/terraform.tfvars"] });
      dm.danger.git.diffForFile = (file) => {
        return setUpTestScenarioObject(`${fixturesPath}/diffForFile/version-modified.ok.json5`)
      }
      return target.validateRdsAuroraModification().then(() => {
        expect(dm.warn).toHaveBeenCalledTimes(0);
        expect(dm.message).toHaveBeenCalledTimes(0);
      })
    })
  })

})
