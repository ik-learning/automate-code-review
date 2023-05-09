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

  // it.each([
  //   [{ fixture: 'models/__fixtures__/template/dynamodb-modified.ok.json' }, 0],
  //   [{ fixture: 'models/__fixtures__/template/dynamodb-modified.bad.json' }, 1],
  //   [{ fixture: 'models/__fixtures__/template/rds-created.bad.json' }, 1],
  //   [{ fixture: 'models/__fixtures__/template/rds-created.ok.json' }, 0],
  //   [{ fixture: 'models/__fixtures__/template/s3-modified.bad.json' }, 1],
  //   [{ fixture: 'models/__fixtures__/template/s3-modified.ok.json' }, 0],
  //   [{ fixture: 'models/__fixtures__/template/rds-deleted.bad.json' }, 1],
  //   [{ fixture: 'models/__fixtures__/template/rds-deleted.ok.json' }, 0],
  // ])("should validate mr template when templateShouldBeEnforced()", (source, times) => {
  //   const fixture = setUpTestScenarioObject(source.fixture);
  //   dm.danger.git.fileMatch = dangerFileMatch(fixture.files);
  //   target.mrDescription = fixture.description

  //   target.templateShouldBeEnforced();
  //   expect(dm.warn).toHaveBeenCalledTimes(times);
  //   if (times > 0) expect(dm.warn).toHaveBeenCalledWith(expect.stringContaining('template is missing'));
  // })

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
})

// infrastructure.js |   29.93 |    78.26 |   44.44 |   29.93
// infrastructure.js |   37.78 |    96.66 |   44.44 |   37.78
// infrastructure.js |   37.38 |      100 |   44.44 |   37.38
// infrastructure.js |   38.76 |      100 |      50 |   38.76
// infrastructure.js |   43.46 |      100 |   54.54 |   43.46
// infrastructure.js |   43.21 |      100 |   54.54 |   43.21 | 131-221,225-295,343-376,379-419,422-435
// infrastructure.js |   43.47 |      100 |   54.54 |   43.47 | 130-220,224-290,338-371,374-414,417-430
// infrastructure.js |   44.96 |      100 |   54.54 |   44.96 | 132-222,226-280,328-361,364-404,407-420
//
