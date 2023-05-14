const { Infrastructure } = require("../../src/models");
const { setUpTestScenarioObject, setUpTestScenario, dangerFileMatch, setupDanger } = require("../fixtures");

describe("test models/infrastructure.js ...", () => {
  let target, dm;

  beforeEach(() => {
    dm = setupDanger();
    target = new Infrastructure(dm.danger);
  })

  it.each([
    [0, { created: [] }],
    [0, { created: ['rds/envs/dev/terragrunt.hcl', 'rds/envs/dev/terraform.tfvars'] }],
    [0, { created: ['rds-aurora/envs/dev/terragrunt.hcl', 'rds-aurora/envs/dev/terraform.tfvars'] }],
    [1, { created: ['rds/envs/dev/terraform.tfvars'] }],
    [1, { created: ['rds/envs/dev/terragrunt.hcl'] }],
    [1, { created: ['rds-aurora/envs/dev/terraform.tfvars'] }],
    [1, { created: ['rds-aurora/envs/dev/terragrunt.hcl'] }],
  ])("should warn when templateShouldBeEnforced() and single stack is modified", (times, keyedPaths) => {
    dm.danger.git.fileMatch = dangerFileMatch(keyedPaths);
    target.validateVarsAndHclCreated();

    expect(dm.warn).toHaveBeenCalledTimes(times);
    if (times > 0) expect(dm.warn).toHaveBeenCalledWith(expect.stringContaining('file detected* for every'))
  })

  it.each([
    [0, { created: [] }],
    [0, { created: ['rds/envs/dev/terraform.tfvars'] }],
    [0, { created: ['rds-aurora/envs/dev/terraform.tfvars'] }],
    [0, { created: ['rds-aurora/envs/dev/terraform.tfvars', 'rds-aurora/envs/dev/38e7/terraform.tfvars'] }],
    [0, { created: ['rds/envs/dev/terraform.tfvars', 'rds/envs/dev/38e7/terraform.tfvars'] }],
    [0, { created: ['rds/envs/dev/9aa2/terraform.tfvars', 'rds/envs/dev/11ed/terraform.tfvars'] }, 'Do you need **prod**'],
    [0, { created: ['rds-aurora/envs/dev/9aa2/terraform.tfvars', 'rds-aurora/envs/dev/11ed/terraform.tfvars'] }, 'Do you need **prod**'],
    [1, { created: ['rds/envs/dev/9aa2/terraform.tfvars', 'rds/envs/prod/11ed/terraform.tfvars'] }, 'Do you need **prod**'],
    [1, { created: ['rds-aurora/envs/dev/9aa2/terraform.tfvars', 'rds-aurora/envs/prod/11ed/terraform.tfvars'] }, 'Do you need **prod**'],
  ])("should message when ensureSingleStackAtOnceCreated() and stacks modified", (times, keyedPaths, msg='') => {
    dm.danger.git.fileMatch = dangerFileMatch(keyedPaths);
    target.validateSingleStackAtOnceCreated();

    expect(dm.message).toHaveBeenCalledTimes(times);
    if (times > 0) expect(dm.message).toHaveBeenCalledWith(expect.stringContaining(msg))
  })

  describe("validateRdsCreation()", () => {
    it.each([
      [0, { created: [] }],
      [1, { created: ['rds/envs/dev/terraform.tfvars'] }],
      [1, { created: ['rds-aurora/envs/dev/terraform.tfvars'] }],
      [1, { created: ['rds-aurora/envs/dev/terraform.tfvars', 'rds-aurora/envs/dev/38e7/terraform.tfvars'] }],
      [1, { created: ['rds/envs/dev/terraform.tfvars', 'rds/envs/dev/38e7/terraform.tfvars'] }],
      [1, { created: ['rds/envs/dev/9aa2/terraform.tfvars', 'rds/envs/dev/11ed/terraform.tfvars'] }],
      [1, { created: ['rds-aurora/envs/dev/9aa2/terraform.tfvars', 'rds-aurora/envs/dev/11ed/terraform.tfvars'] }],
      [1, { created: ['rds/envs/dev/9aa2/terraform.tfvars', 'rds/envs/prod/11ed/terraform.tfvars'] }],
      [1, { created: ['rds-aurora/envs/dev/9aa2/terraform.tfvars', 'rds-aurora/envs/prod/11ed/terraform.tfvars'] }],
    ])("should message when validateRdsPlan() and stack is modified", (times, keyedPaths) => {
      dm.danger.git.fileMatch = dangerFileMatch(keyedPaths);
      target.validateRdsPlan();

      expect(dm.message).toHaveBeenCalledTimes(times);
      if (times > 0) expect(dm.message).toHaveBeenCalledWith(expect.stringContaining('Make sure to verify the `plan` job'))
    })
  })

  describe("validateRdsCreation()", () => {

    it.each([
      [{ created: ['rds/dev/ci-server/terraform.tfvars'] }, 'mysql/create.diff.ok.json', 0],
      [{ created: ['rds/dev/test-server/terraform.tfvars'] }, 'mysql/create.diff.bad.json', 1],
      [{ created: ['rds/dev/this-server/terraform.tfvars'] }, 'mysql/mysql5-rds-create.diff.json', 1],
      [{ created: ['rds/dev/app-server/terraform.tfvars'] }, 'mysql/create.no-instance.ok.json', 0],
      [{ created: ['rds/dev/pg-server/terraform.tfvars'] }, 'postgres/create.diff.ok.json', 0],
      [{ created: ['rds/dev/pg-server/terraform.tfvars'] }, 'postgres/create.no-instance.ok.json', 0],
      [{ created: ['rds/dev/pg-server/terraform.tfvars'] }, 'postgres/create.db.t3.medium.json', 1],
    ])("should messages when ensureRdsCreationValidated() with single stack in dev modified", (keyedPaths, scenario, times) => {
      dm.danger.git.fileMatch = dangerFileMatch(keyedPaths);
      dm.danger.git.diffForFile = (file) => {
        return setUpTestScenarioObject(`models/__fixtures__/${scenario}`)
      }
      return target.validateRdsCreation().then(() => {
        expect(dm.warn).toHaveBeenCalledTimes(times);
      })
    })

    it("should warn when validateRdsCreation() with outdated postgres11 'engine' and 'storage'", () => {
      dm.danger.git.fileMatch = dangerFileMatch(setUpTestScenarioObject('models/__fixtures__/postgres/rds-created.json'));
      dm.danger.git.diffForFile = (file) => {
        return setUpTestScenarioObject(`models/__fixtures__/postgres/postgres11-outdated-engine-storage.warn.json`)
      }
      return target.validateRdsCreation().then(() => {
        expect(dm.warn).toHaveBeenCalledTimes(3);
        expect(dm.message).toHaveBeenCalledTimes(1);
        expect(dm.warn).toHaveBeenCalledWith(expect.stringContaining('create an rds with outdated engine?'));
        expect(dm.warn).toHaveBeenCalledWith(expect.stringContaining('Recommended `storage_type` is `gp3`'));
        expect(dm.warn).toHaveBeenCalledWith(expect.stringContaining('In `dev` environment instance class `db.m5.large` not recommended'));
      })
    })

    it("should warn when validateRdsCreation() with not recommended 'instance_class'", () => {
      dm.danger.git.fileMatch = dangerFileMatch(setUpTestScenarioObject('models/__fixtures__/postgres/rds-created-prod.json'));
      dm.danger.git.diffForFile = (file) => {
        return setUpTestScenarioObject('models/__fixtures__/postgres/family15-instance_class-outdated.warn.json')
      }
      return target.validateRdsCreation().then(() => {
        expect(dm.warn).toHaveBeenCalledTimes(2);
        expect(dm.message).toHaveBeenCalledTimes(1);
        expect(dm.warn).toHaveBeenCalledWith(expect.stringContaining('In `prod` environment instance class `db.t3.medium` not recommended'));
        expect(dm.warn).toHaveBeenCalledWith(expect.stringContaining('Recommended `storage_type` is `gp3`'));
      })
    })


    it("should warn when validateRdsCreation() with outdated mysql5 'engine' and 'storage'", () => {
      dm.danger.git.fileMatch = dangerFileMatch(setUpTestScenarioObject('models/__fixtures__/mysql/rds-created.json'));
      dm.danger.git.diffForFile = (file) => {
        return setUpTestScenarioObject(`models/__fixtures__/mysql/mysql5.7-outdated-enginer-storage.warn.json`)
      }
      return target.validateRdsCreation().then(() => {
        expect(dm.warn).toHaveBeenCalledTimes(2);
        expect(dm.warn).toHaveBeenCalledWith(expect.stringContaining('create an rds with outdated engine?'));
        expect(dm.warn).toHaveBeenCalledWith(expect.stringContaining('Recommended `storage_type` is `gp3`'));
      })
    })
  })

  describe("validateRdsAuroraCreation()", () => {

    it.each([
      ['models/__fixtures__/storage/rds-aurora-created.json'],
      ['models/__fixtures__/storage/rds-aurora-modified.json']
    ])("should warn when validateRdsAuroraCreation() number of stacks hits the threshold", (scenario) => {
      dm.danger.git.fileMatch = dangerFileMatch(setUpTestScenarioObject(scenario));
      return target.validateRdsAuroraCreation().then(() => {
        expect(dm.warn).toHaveBeenCalledTimes(1);
        expect(dm.warn).toHaveBeenCalledWith(expect.stringContaining('Skip review as number of'));
      })
    })
  })

  describe("validateRdsCommons()", () => {

    it("should warn when validateRdsCommons() with multiple number of stacks", () => {
      dm.danger.git.fileMatch = dangerFileMatch(setUpTestScenarioObject('models/__fixtures__/storage/rds-multiple.json'));
      target.validateRdsCommons()
      expect(dm.warn).toHaveBeenCalledTimes(1);
      expect(dm.warn).toHaveBeenCalledWith(expect.stringContaining('Multiple configurations modified in single MR'));
    })

    it.each([
      ['models/__fixtures__/storage/rds-created.json'],
      ['models/__fixtures__/storage/rds-modified.json']
    ])("should messages when ensureRdsCreationValidated() number of stacks hits the threshold", (scenario) => {
      dm.danger.git.fileMatch = dangerFileMatch(setUpTestScenarioObject(scenario));
      target.validateRdsCommons()
      expect(dm.warn).toHaveBeenCalledTimes(1);
      expect(dm.warn).toHaveBeenCalledWith(expect.stringContaining('Skip review as number of'));
    })
  })

  describe("validateRdsModification()", () => {

    it.each([
      ['models/__fixtures__/storage/rds-created.json'],
      ['models/__fixtures__/storage/rds-modified.json']
    ])("should not message when validateRdsModification() with number of modified fiels ", (scenario) => {
      dm.danger.git.fileMatch = dangerFileMatch(setUpTestScenarioObject(scenario));
      return target.validateRdsModification().then(() => {
        expect(dm.warn).toHaveBeenCalledTimes(0);
        expect(dm.message).toHaveBeenCalledTimes(0);;
      })
    })

    it("should warn when validateRdsModification() and instance_class modified", () => {
      dm.danger.git.fileMatch = dangerFileMatch(setUpTestScenarioObject('models/__fixtures__/postgres/rds-modified.json'));
      dm.danger.git.diffForFile = (file) => {
        return setUpTestScenarioObject('models/__fixtures__/postgres/instance_class-modified.warn.json')
      }
      return target.validateRdsModification().then(() => {
        expect(dm.message).toHaveBeenCalledTimes(2);
        expect(dm.message).toHaveBeenCalledWith(expect.stringContaining('provide a link to datadog dashboard'));
        expect(dm.message).toHaveBeenCalledWith(expect.stringContaining('review CI job output attribute'));
      });
    })

    it("should not warn when validateRdsModification() and version modified", () => {
      dm.danger.git.fileMatch = dangerFileMatch(setUpTestScenarioObject('models/__fixtures__/postgres/rds-modified.json'));
      dm.danger.git.diffForFile = (file) => {
        return setUpTestScenarioObject('models/__fixtures__/postgres/gp2-not-modified.warn.json')
      }
      return target.validateRdsModification().then(() => {
        expect(dm.message).toHaveBeenCalledTimes(2);
        expect(dm.message).toHaveBeenCalledWith(expect.stringContaining('Recommended `storage_type` is `gp3`'));
        expect(dm.message).toHaveBeenCalledWith(expect.stringContaining('review CI job output attribute'));
      });
    })
  })
})
