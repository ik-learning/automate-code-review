const { Infrastructure } = require("../../src/models");
const { setUpTestScenarioObject, setUpTestScenario,
  dangerFileMatch, setupDanger } = require("../fixtures");

describe("test models/infrastructure.js ...", () => {
  let target, dm;
  const fixturesPath = "models/__fixtures__";

  beforeEach(() => {
    dm = setupDanger();
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

  it("should not messages when rdsMysql5EndOfLifeDate() and stack is not modified", () => {
    target.rdsMysql5EndOfLifeDate()
    expect(dm.message).toHaveBeenCalledTimes(0);
  })

  it("should not messages when rdsMysql5EndOfLifeDate() and rds family is not 'mysql5'", () => {
    dm.danger.git.fileMatch = dangerFileMatch({ modified: ['rds/stack/dev/values.tfvars'], created: [] });
    mapping = {
      'rds/stack/dev/values.tfvars': `${fixturesPath}/mysql/diffForFile/mysql8-updated.json`,
    }
    dm.danger.git.diffForFile = (file) => {
      return setUpTestScenarioObject(mapping[file])
    }
    return target.rdsMysql5EndOfLifeDate().then(() => {
      expect(dm.message).toHaveBeenCalledTimes(0);
    })
  })

  it.each([
    [{ modified: ['rds/stack/dev/values.tfvars'], created: [] }],
    [{ modified: [], created: ['rds/stack/prod/values.tfvars'] }],
  ])("should messages when rdsMysql5EndOfLifeDate() and rds family is mysql5", (keyedPaths) => {
    dm.danger.git.fileMatch = dangerFileMatch(keyedPaths);
    mapping = {
      'rds/stack/dev/values.tfvars': `${fixturesPath}/mysql/diffForFile/mysql5-updated.json`,
      'rds/stack/prod/values.tfvars': `${fixturesPath}/mysql/diffForFile/mysql5-updated.json`,
    }
    dm.danger.git.diffForFile = (file) => {
      return setUpTestScenarioObject(mapping[file])
    }
    return target.rdsMysql5EndOfLifeDate().then(() => {
      expect(dm.warn).toHaveBeenCalledTimes(1);
      expect(dm.warn).toHaveBeenCalledWith(expect.stringContaining('MySQL5.7 End of life support is October 2023'));
    })
  });
})
