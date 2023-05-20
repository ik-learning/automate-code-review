
const { WebHookValidator } = require('../src/validate');
const { setUpTestScenario } = require("./fixtures");

describe("Test validate.js ...", () => {
  let target;
  const fixturesPath = "models/__fixtures__/webhooks";

  beforeEach(() => {})

  describe("WebHookValidator.isBot()", () => {
    it.each([
      ["mr.approved-bot.json", true],
      ["mr.opened.preparing.json", false],
    ])("should execute isNotAMergeRequest()", (fixture, expected) => {
      target = new WebHookValidator(setUpTestScenario(`${fixturesPath}/${fixture}`));
      expect(target.isBot()).toBe(expected);
    })
  })

  describe("WebHookValidator.isNotAMergeRequest()", () => {
    it.each([
      ["mr.update-desc.json", false],
      ["mr.closed.json", false],
      ["issue.json", true],
    ])("should execute isNotAMergeRequest()", (fixture, expected) => {
      target = new WebHookValidator(setUpTestScenario(`${fixturesPath}/${fixture}`));
      expect(target.isNotAMergeRequest()).toBe(expected);
    })
  })

  describe("WebHookValidator.isOnlyDescriptionUpdated()", () => {
    it.each([
      ["mr.update-desc.json", true],
      ["mr.closed.json", false],
    ])("should execute isOnlyDescriptionUpdated()", (fixture, expected) => {
      target = new WebHookValidator(setUpTestScenario(`${fixturesPath}/${fixture}`));
      expect(target.isOnlyDescriptionUpdated()).toBe(expected);
    })
  })

  describe("WebHookValidator.toString()", () => {
    it("should execute toString()", () => {
      target = new WebHookValidator(setUpTestScenario(`${fixturesPath}/mr.json`));
      expect(target.toString()).toContain("gitlab.com/MyCompany/platform");
    })
  })
})
