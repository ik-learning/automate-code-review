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

  it("test", () => {
    expect(1).toBe(1);
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

  it.each([
    ['models/__fixtures__/storage/rds-created.json'],
    ['models/__fixtures__/storage/rds-modified.json']
  ])("should messages when ensureRdsCreationValidated() number of stacks hits the threshold", (scenario) => {
    dm.danger.git.fileMatch = dangerFileMatch(setUpTestScenarioObject(scenario));
    return target.validateRdsCreation().then(() => {
      expect(dm.warn).toHaveBeenCalledTimes(1);
      expect(dm.warn).toHaveBeenCalledWith(expect.stringContaining('Skip review as number of'));
    })
  })

  it("should messages when ensureRdsCreationValidated() with multiple number of stacks", () => {
    dm.danger.git.fileMatch = dangerFileMatch(setUpTestScenarioObject('models/__fixtures__/storage/rds-multiple.diff.json'));
    return target.validateRdsCreation().then(() => {
      expect(dm.warn).toHaveBeenCalledTimes(1);
      expect(dm.warn).toHaveBeenCalledWith(expect.stringContaining('Multiple configurations modified in single MR'));
    })
  })

  it.each([
    [{ created: ['rds/dev/ci-server/terraform.tfvars'] }, 'mysql/create.diff.ok.json', 0],
    [{ created: ['rds/dev/test-server/terraform.tfvars'] }, 'mysql/create.diff.bad.json', 1],
    [{ created: ['rds/dev/this-server/terraform.tfvars'] }, 'mysql/mysql5-rds-create.diff.json', 0],
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
      if (times > 0) expect(dm.warn).toHaveBeenCalledWith(expect.stringContaining('`db.t3.medium` not recommended'));
    })
  })

  it.each([
    ['models/__fixtures__/storage/rds-aurora-created.json'],
    ['models/__fixtures__/storage/rds-aurora-modified.json']
  ])("should messages when validateRdsAuroraCreation() number of stacks hits the threshold", (scenario) => {
    dm.danger.git.fileMatch = dangerFileMatch(setUpTestScenarioObject(scenario));
    return target.validateRdsAuroraCreation().then(() => {
      expect(dm.warn).toHaveBeenCalledTimes(1);
      expect(dm.warn).toHaveBeenCalledWith(expect.stringContaining('Skip review as number of'));
    })
  })

})
