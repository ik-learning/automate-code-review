
jest.mock("danger", () => jest.fn())

var danger = require("danger");
var dm = danger;

global.message = (input) => {
  dm.message(input)
}

const { Apply } = require("../../src/models");
let target;

describe("test models/apply.js ...", () => {

  beforeEach(() => {
    dm.message = jest.fn();
    dm.danger = jest.fn();
    dm.danger.gitlab = jest.fn();
    dm.danger.gitlab.metadata = jest.fn();
    target = new Apply(dm.danger);
  })

  it("should message when addManualApplyMsg() and at least single file is committed", () => {
    target._committedFiles = ['.gitlab-ci.yml'];
    return target.addManualApplyMsg().then(() => {
      expect(dm.message).toHaveBeenCalledTimes(1);
      expect(dm.message).toHaveBeenCalledWith("🔰  You'll need to run the manual apply job when changes merged...");
      expect(dm.message).toHaveBeenCalledWith(expect.stringContaining('need to run the manual apply'));
    })
  })

  it("should not message when addManualApplyMsg() and not a single file is committed", () => {
    target._committedFiles = [];
    return target.addManualApplyMsg().then(() => {
      expect(dm.message).toHaveBeenCalledTimes(0);
    })
  })

  it("should message when addPaasManualApplyMsg()", () => {
    return target.addPaasManualApplyMsg().then(() => {
      expect(dm.message).toHaveBeenCalledTimes(1);
      expect(dm.message).toHaveBeenCalledWith("🔰  PaaS need to merge and apply changes...");
    })
  })

})
