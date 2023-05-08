
jest.mock("danger", () => jest.fn())
const chainsmoker = require('../../node_modules/danger/distribution/commands/utils/chainsmoker.js')
const danger = require("danger");
let dm = danger;

const { setUpTestScenarioObject, setUpTestScenario } = require("../fixtures");

const { MSK } = require("../../src/models");
let target;

describe("test models/msk.js ...", () => {

  beforeEach(() => {

    global.message = (input) => dm.message(input);
    global.warn = (input) => dm.warn(input);

    dm = {
      message: jest.fn(),
      warn: jest.fn(),
      danger: {
        git: {
          fileMatch: jest.fn(),
          diffForFile: jest.fn(),
        },
        gitlab: {
          metadata: {
            pullRequestID: jest.fn()
          },
          mr: {
            description: '',
          }
        },
      },
    }
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
      dm.danger.git.fileMatch = chainsmoker.default(keyedPaths);
      dm.danger.gitlab.mr.description = setUpTestScenario(`models/__fixtures__/msk/${description}`)
      dm.danger.git.diffForFile = (file) => {
        return setUpTestScenarioObject(`models/__fixtures__/msk/${csvDiff}`)
      }
      return target.templateShouldBeEnforcedMsk().then(() => {
        expect(dm.message).toHaveBeenCalledTimes(messageTimes);
        expect(dm.warn).toHaveBeenCalledTimes(warnTimes);
        if (messageTimes === 1) expect(dm.message).toHaveBeenCalledWith(expect.stringContaining('the team should decide'));
        if (warnTimes === 1) expect(dm.warn).toHaveBeenCalledWith(expect.stringContaining('template is missing'));
      })
  });

  it("should not post a message when templateShouldBeEnforcedMsk() in cases when target file not modified", () => {
    dm.danger.git.fileMatch = chainsmoker.default({ modified: [], created: [], deleted: [], edited: [] });
    return target.templateShouldBeEnforcedMsk().then(() => {
      expect(dm.message).toHaveBeenCalledTimes(0);
      expect(dm.warn).toHaveBeenCalledTimes(0);
    })
  })

  it("should post a message when csvEntryAlphabeticOrder() not in alphabetic order", () => {
    const nonAlphabetic = 'models/__fixtures__/msk/topics-added-diff.non-order.csv.json';
    dm.danger.git.fileMatch = chainsmoker.default({ modified: ['msk-topics.csv'] });
    dm.danger.git.diffForFile = (file) => {
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
    const nonAlphabetic = 'models/__fixtures__/msk/topics-added-diff.non-order.split.csv.json';
    dm.danger.git.fileMatch = chainsmoker.default({ modified: ['msk-topics.csv'] });
    dm.danger.git.diffForFile = (file) => {
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
    const nonAlphabetic = 'models/__fixtures__/msk/topic-added-diff.order.csv.json';
    dm.danger.git.fileMatch = chainsmoker.default({ modified: ['msk-topics.csv'] });
    dm.danger.git.diffForFile = (file) => {
      if (file === 'msk-topics.csv') return setUpTestScenarioObject(nonAlphabetic)
    }
    return target.csvEntryAlphabeticOrder().then(() => {
      expect(dm.warn).toHaveBeenCalledTimes(0);
    })
  })

  it("should post a message when csvEntryAlphabeticOrder() and topic updated", () => {
    const nonAlphabetic = 'models/__fixtures__/msk/topics-updated-diff.order.csv.json';
    dm.danger.git.fileMatch = chainsmoker.default({ modified: ['msk-topics.csv'] });
    dm.danger.git.diffForFile = (file) => {
      if (file === 'msk-topics.csv') return setUpTestScenarioObject(nonAlphabetic)
    }
    return target.csvEntryAlphabeticOrder().then(() => {
      expect(dm.warn).toHaveBeenCalledTimes(0);
      expect(dm.message).toHaveBeenCalledTimes(0);
    })
  })

})
