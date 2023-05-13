const { Infrastructure } = require("../../src/models");
const { setUpTestScenarioObject, setUpTestScenario, dangerFileMatch, setupDanger } = require("../fixtures");

describe("test models/infrastructure.js ...", () => {
  let target, dm;

  beforeEach(() => {
    dm = setupDanger();
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
