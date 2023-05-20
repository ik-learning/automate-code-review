const { Infrastructure } = require("../../src/models");
const { setUpTestScenarioObject, setUpTestScenario, dangerFileMatch, setupDanger } = require("../fixtures");

describe("test models/infrastructure.js ...", () => {
  let target, dm;
  const fixturesPath = "models/__fixtures__/template";

  beforeEach(() => {
    dm = setupDanger();
    target = new Infrastructure(dm.danger);
  })

  it.each([
    [{ fixture: 'dynamodb-modified.ok.json' }, 0],
    [{ fixture: 'dynamodb-modified.bad.json' }, 1],
    [{ fixture: 'rds-created.bad.json' }, 1],
    [{ fixture: 'rds-created.ok.json' }, 0],
    [{ fixture: 's3-modified.bad.json' }, 1],
    [{ fixture: 's3-modified.ok.json' }, 0],
    [{ fixture: 'rds-deleted.bad.json' }, 1],
    [{ fixture: 'rds-deleted.ok.json' }, 0],
  ])("should validate mr template when templateShouldBeEnforced()", (source, times) => {
    const fixture = setUpTestScenarioObject(`${fixturesPath}/${source.fixture}`);
    dm.danger.git.fileMatch = dangerFileMatch(fixture.files);
    target.mrDescription = fixture.description

    target.templateShouldBeEnforced();
    expect(dm.warn).toHaveBeenCalledTimes(times);
    if (times > 0) expect(dm.warn).toHaveBeenCalledWith(expect.stringContaining('template is missing'));
  })

  it("should validate mr template when templateShouldBeEnforced() and multiple stacks modified", () => {
    const fixture = setUpTestScenarioObject(`${fixturesPath}/multiple-stacks.bad.json`);
    dm.danger.git.fileMatch = dangerFileMatch(fixture.files);
    target.mrDescription = fixture.description;
    target.templateShouldBeEnforced()
    expect(dm.fail).toHaveBeenCalledTimes(1);
    expect(dm.fail).toHaveBeenCalledWith(expect.stringContaining('multiple resources "created|modified|deleted"'));
  })
})
