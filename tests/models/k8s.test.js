const { K8S } = require("../../src/models");
const { setUpTestScenarioObject, setUpTestScenario,
  dangerFileMatch, setupDanger } = require("../fixtures");

describe("test models/k8s.js ...", () => {
  let target, dm;
  beforeEach(() => {
    dm = setupDanger();
    target = new K8S(dm.danger);
  })

  it("should post multiple messages when k8sDeployTestsAdded() and not a single test provided", () => {
    dm.danger.git.fileMatch = dangerFileMatch({ modified: [], created: [], deleted: [], edited: [] });
    return target.k8sDeployTestsAdded().then(() => {
      expect(dm.message).toHaveBeenCalledTimes(2);
      expect(dm.message).toHaveBeenCalledWith(expect.stringContaining('description of how the change'));
      expect(dm.message).toHaveBeenCalledWith(expect.stringContaining('is a relevant test in'));
    })
  })

  it.each([
    [1, { modified: ['k8s/sandbox/tests/values.yml'], created: [], deleted: [], edited: [] }],
    [1, { modified: [], created: ['k8s/helm/deployment/tests/unit/values/securityContext/cron.yaml'], deleted: [], edited: [] }],
    [1, { modified: ['k8s/sandbox/tests/values.yml'], created: ['k8s/helm/deployment/tests/unit/values/securityContext/cron.yaml'], deleted: [], edited: [] }],
    [2, { modified: [], created: [], deleted: ['k8s/sandbox/tests/values.yml'], edited: [] }],
  ])('should post %p messages when k8sDeployTestsAdded() and at least a single test is provided', (times, keyedPaths) => {
    dm.danger.git.fileMatch = dangerFileMatch(keyedPaths);
    return target.k8sDeployTestsAdded().then(() => {
      expect(dm.message).toHaveBeenCalledTimes(times);
    })
  });
})
