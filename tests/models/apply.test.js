const { Apply } = require("../../src/models");
const { setupDanger } = require("../fixtures");

describe("test models/apply.js ...", () => {
  beforeEach(() => {
    dm = setupDanger();
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
