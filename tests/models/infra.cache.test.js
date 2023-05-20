const { Infrastructure } = require("../../src/models");
const { setUpTestScenarioObject, setUpTestScenario, dangerFileMatch, setupDanger } = require("../fixtures");

describe("test models/infrastructure.js ...", () => {
  let target, dm;
  const fixturesPath = "models/__fixtures__/cache/";

  beforeEach(() => {
    dm = setupDanger();
    target = new Infrastructure(dm.danger);
  })

  it.each([
    [0, { created: [] }],
    [0, {
      created: [
        'elasticache/dev/terraform.tfvars',
        'elasticache/stage/terraform.tfvars',
        'elasticache/uat/terraform.tfvars']
    }],
  ])("should not warn when validateCacheCreation() and number of created files hit threshold", (times, keyedPaths) => {
    dm.danger.git.fileMatch = dangerFileMatch(keyedPaths);
    target.validateCacheCreation();
    expect(dm.warn).toHaveBeenCalledTimes(times);
  })

  it.each([
    [0, { created: [] }, null],
    [1, { created: ['elasticache/dev/terraform.tfvars'] }, "create.node_type-outdated.json5"],
    [0, { created: ['elasticache/uat/terraform.tfvars'] }, "create.json5"],
  ])("should warn/not-warn when validateCacheCreation()", (times, keyedPaths, diffForFile) => {
    dm.danger.git.fileMatch = dangerFileMatch(keyedPaths);
    dm.danger.git.diffForFile = (file) => {
      if (diffForFile) return setUpTestScenarioObject(`${fixturesPath}/diffForFile/${diffForFile}`)
    }

    return target.validateCacheCreation().then(() => {
      expect(dm.warn).toHaveBeenCalledTimes(times);
      if (times) expect(dm.warn).toHaveBeenCalledWith(expect.stringContaining('node_type:cache.t4g.medium'))
    });
  })

})
