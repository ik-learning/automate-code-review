const { MSK } = require("../../src/models");
const { setUpTestScenarioObject, setUpTestScenario, dangerFileMatch, setupDanger } = require("../fixtures");

describe("test models/msk.js ...", () => {
  let target, dm;
  const fixturesPath = "models/__fixtures__/msk";

  beforeEach(() => {
    dm = setupDanger();
    target = new MSK(dm.danger);
  })

  it.each([
    [{ modified: ['topics.csv'] }, 'added-topics.description-ok.txt', 'added-topics-diff.csv.json', 1, 0],
    [{ modified: ['topics.csv'] }, 'added-topics.description-bad.txt', 'added-topics-diff.csv.json', 1, 1],
    [{ modified: ['topics.csv'] }, 'removed-topics.description-bad.txt', 'removed-topics-diff.csv.json', 1, 1],
    [{ modified: ['topics.csv'] }, 'removed-topics.description-ok.txt', 'removed-topics-diff.csv.json', 1, 0],
    [{ modified: ['topics.csv'] }, 'updated-topics.description-ok.txt', 'updated-topics-diff.csv.json', 1, 0],
    [{ modified: ['topics.csv'] }, 'updated-topics.description-bad.txt', 'updated-topics-diff.csv.json', 1, 1],
  ])('should post messages on templateShouldBeEnforcedMsk when topic created|updated|removed',
    (keyedPaths, description, csvDiff, messageTimes, warnTimes) => {
      target.mrDescription = setUpTestScenario(`${fixturesPath}/scenario/${description}`)
      dm.danger.git.fileMatch = dangerFileMatch(keyedPaths);
      dm.danger.git.diffForFile = (file) => {
        return setUpTestScenarioObject(`${fixturesPath}/diffForFile/${csvDiff}`)
      }
      return target.templateShouldBeEnforcedMsk().then(() => {
        expect(dm.message).toHaveBeenCalledTimes(messageTimes);
        expect(dm.warn).toHaveBeenCalledTimes(warnTimes);
        if (messageTimes === 1) expect(dm.message).toHaveBeenCalledWith(expect.stringContaining('the team should decide'));
        if (warnTimes === 1) expect(dm.warn).toHaveBeenCalledWith(expect.stringContaining('template is missing'));
      })
  });

  it("should not post a message when templateShouldBeEnforcedMsk() in cases when target file not modified", () => {
    dm.danger.git.fileMatch = dangerFileMatch({ modified: [], created: [], deleted: [], edited: [] });
    return target.templateShouldBeEnforcedMsk().then(() => {
      expect(dm.message).toHaveBeenCalledTimes(0);
      expect(dm.warn).toHaveBeenCalledTimes(0);
    })
  })

  it("should post a message when csvEntryAlphabeticOrder() not in alphabetic order", () => {
    dm.danger.git.fileMatch = dangerFileMatch({ modified: ['msk-topics.csv'] });
    dm.danger.git.diffForFile = (file) => {
      const nonAlphabetic = `${fixturesPath}/diffForFile/topics-added-diff.non-order.csv.json`;
      if (file === 'msk-topics.csv') return setUpTestScenarioObject(nonAlphabetic)
    }
    const topics = `
+ 168 sc_wms_inbound_container_closed,3,6
+ 169 sc_wms_inbound_container_closed_error,3,1
+ 170 sc_wms_movement_completed,3,6
+ 171 sc_wms_task_status_changed,3,6`
    return target.csvEntryAlphabeticOrder().then(() => {
      expect(dm.warn).toHaveBeenCalledTimes(1);
      expect(dm.warn).toHaveBeenCalledWith(expect.stringContaining(topics));
    })
  })

  it("should post a message when csvEntryAlphabeticOrder() not in alphabetic order topics added not in order", () => {
    dm.danger.git.fileMatch = dangerFileMatch({ modified: ['msk-topics.csv'] });
    dm.danger.git.diffForFile = (file) => {
      const nonAlphabetic = `${fixturesPath}/diffForFile/topics-added-diff.non-order.split.csv.json`;
      if (file === 'msk-topics.csv') return setUpTestScenarioObject(nonAlphabetic)
    }
    const topics = `
+ 76 test-topic-code-review,2,3
+ 146 oaftfer-upsert-events,3,3`
    return target.csvEntryAlphabeticOrder().then(() => {
      expect(dm.warn).toHaveBeenCalledTimes(1);
      expect(dm.warn).toHaveBeenCalledWith(expect.stringContaining(topics));
    })
  })

  it("should post a message when csvEntryAlphabeticOrder() in alphabetic order and single topic added in order", () => {
    dm.danger.git.fileMatch = dangerFileMatch({ modified: ['msk-topics.csv'] });
    dm.danger.git.diffForFile = (file) => {
      const nonAlphabetic = `${fixturesPath}/diffForFile/topic-added-diff.order.csv.json`;
      if (file === 'msk-topics.csv') return setUpTestScenarioObject(nonAlphabetic)
    }
    return target.csvEntryAlphabeticOrder().then(() => {
      expect(dm.warn).toHaveBeenCalledTimes(0);
    })
  })

  it("should post a message when csvEntryAlphabeticOrder() and topic updated", () => {
    dm.danger.git.fileMatch = dangerFileMatch({ modified: ['msk-topics.csv'] });
    dm.danger.git.diffForFile = (file) => {
      const nonAlphabetic = `${fixturesPath}/diffForFile/topics-updated-diff.order.csv.json`;
      if (file === 'msk-topics.csv') return setUpTestScenarioObject(nonAlphabetic)
    }
    return target.csvEntryAlphabeticOrder().then(() => {
      expect(dm.warn).toHaveBeenCalledTimes(0);
      expect(dm.message).toHaveBeenCalledTimes(0);
    })
  })

  it("should test paradox", () => {
    dm.danger.git.fileMatch = dangerFileMatch({ modified: [] });
    return target.run().then(() => {
      expect(dm.warn).toHaveBeenCalledTimes(0);
      expect(dm.message).toHaveBeenCalledTimes(0);
    })
  })
})
