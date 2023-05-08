
jest.mock("danger", () => jest.fn())
const chainsmoker = require('../../node_modules/danger/distribution/commands/utils/chainsmoker.js')

const danger = require("danger");
let dm = danger;

global.message = (input) => {
  dm.message(input)
}

const { K8S } = require("../../src/models");
let target;

describe("test models/k8s.js ...", () => {
  beforeEach(() => {
    dm = {
      message: jest.fn(),
      danger: {
        git: {
          fileMatch: chainsmoker.default({ modified: [], created: [], deleted: [], edited: [] }),
        },
        gitlab: {
          metadata: {
            pullRequestID: jest.fn()
          }
        },
      },
    }
    target = new K8S(dm.danger);
  })

  it("should post multiple messages when k8sDeployTestsAdded() and not a single test provided", () => {
    dm.danger.git.fileMatch = chainsmoker.default({ modified: [], created: [], deleted: [], edited: [] });
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
    dm.danger.git.fileMatch = chainsmoker.default(keyedPaths);
    return target.k8sDeployTestsAdded().then(() => {
      expect(dm.message).toHaveBeenCalledTimes(times);
    })
  });
})
