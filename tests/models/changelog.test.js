
jest.mock("danger", () => jest.fn())
const chainsmoker = require('../../node_modules/danger/distribution/commands/utils/chainsmoker.js')
var danger = require("danger");
var dm = danger;

global.message = (input) => {
  dm.message(input)
}

const { Changelog } = require("../../src/models");
let target;

describe("test models/changelog.js ...", () => {

  beforeEach(() => {
    global.message = (input) => dm.message(input);
    global.warn = (input) => dm.warn(input)
    dm = {
      message: jest.fn(),
      warn: jest.fn(),
      danger: {
        git: {
          fileMatch: chainsmoker.default({ modified: [] })
        },
        gitlab: {
          metadata: {
            pullRequestID: jest.fn()
          },
          mr: {
            state: '',
            title: ''
          },
          approvals: {}
        },
      },
    }
    target = new Changelog(dm.danger);
  })

  // it("should message when addPaasManualApplyMsg", () => {
  //   return target.addPaasManualApplyMsg().then(() => {
  //     expect(dm.message).toHaveBeenCalledTimes(1);
  //     expect(dm.message).toHaveBeenCalledWith("🔰  PaaS need to merge and apply changes...");
  //   })
  // })

  it("should message when changelogNotPresent()", () => {
    dm.danger.git.fileMatch = chainsmoker.default({ modified: ['CHANGELOG.md'] });
    return target.changelogNotPresent().then(() => {
      expect(dm.warn).toHaveBeenCalledTimes(0);
    })
  })

  it("should message when changelogNotPresent() and single file modified", () => {
    target._committedFiles = ['.gitlab-ci.yml'];
    return target.changelogNotPresent().then(() => {
      expect(dm.warn).toHaveBeenCalledTimes(1);
      expect(dm.warn).toHaveBeenCalledWith(expect.stringContaining('modifies single file'));
    })
  })

  it("should message when changelogNotPresent() and multiple files modified", () => {
    target._committedFiles = ['.gitlab-ci.yml', 'helm/tests/values.yml'];
    return target.changelogNotPresent().then(() => {
      expect(dm.warn).toHaveBeenCalledTimes(1);
      expect(dm.warn).toHaveBeenCalledWith(expect.stringContaining('modifies multiple files'));
    })
  })

  it("should message when addPaasManualApplyMsg", () => {
    return target.chartYamlVersionReleased().then(() => {
      expect(dm.message).toHaveBeenCalledTimes(1);
      expect(dm.message).toHaveBeenCalledWith("🤖 On release, make sure chart `version` is updated in `Chart.yaml` file.");
    })
  })
})
