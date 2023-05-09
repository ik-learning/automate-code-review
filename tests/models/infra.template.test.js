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
    [{ fixture: 'models/__fixtures__/template/dynamodb-modified.ok.json' }, 0],
    [{ fixture: 'models/__fixtures__/template/dynamodb-modified.bad.json' }, 1],
    [{ fixture: 'models/__fixtures__/template/rds-created.bad.json' }, 1],
    [{ fixture: 'models/__fixtures__/template/rds-created.ok.json' }, 0],
    [{ fixture: 'models/__fixtures__/template/s3-modified.bad.json' }, 1],
    [{ fixture: 'models/__fixtures__/template/s3-modified.ok.json' }, 0],
    [{ fixture: 'models/__fixtures__/template/rds-deleted.bad.json' }, 1],
    [{ fixture: 'models/__fixtures__/template/rds-deleted.ok.json' }, 0],
  ])("should validate mr template when templateShouldBeEnforced()", (source, times) => {
    const fixture = setUpTestScenarioObject(source.fixture);
    dm.danger.git.fileMatch = dangerFileMatch(fixture.files);
    target.mrDescription = fixture.description

    target.templateShouldBeEnforced();
    expect(dm.warn).toHaveBeenCalledTimes(times);
    if (times > 0) expect(dm.warn).toHaveBeenCalledWith(expect.stringContaining('template is missing'));
  })

  it("should validate mr template when templateShouldBeEnforced() and multiple stacks modified", () => {
    const fixture = setUpTestScenarioObject('models/__fixtures__/template/multiple-stacks.bad.json');
    dm.danger.git.fileMatch = dangerFileMatch(fixture.files);
    target.mrDescription = fixture.description;
    target.templateShouldBeEnforced()
    expect(dm.fail).toHaveBeenCalledTimes(1);
    expect(dm.fail).toHaveBeenCalledWith(expect.stringContaining('multiple resources "created|modified|deleted"'));
  })
})
