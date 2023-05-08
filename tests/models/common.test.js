jest.mock("danger", () => jest.fn())
const chainsmoker = require('../../node_modules/danger/distribution/commands/utils/chainsmoker.js')
const danger = require("danger");
let dm = danger;

const { setUpTestScenarioObject, setUpTestScenario } = require("../fixtures");

const { Common } = require("../../src/models");
let target;

describe("test models/common.js ...", () => {
  beforeEach(() => {

    global.message = (input) => dm.message(input);
    global.warn = (input) => dm.warn(input);
    global.fail = (input) => dm.fail(input);

    dm = {
      message: jest.fn(),
      warn: jest.fn(),
      fail: jest.fn(),
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
    target = new Common(dm.danger);
  })

  it("should post message when reviewLargePR() and number of changes do exceed a threshold", () => {
    dm.danger.gitlab.mr.changes_count = 15
    target.reviewLargePR();
    expect(dm.fail).toHaveBeenCalledTimes(1);
  })

  it("should not post message when reviewLargePR() and number of changes does not exceed a threshold", () => {
    dm.danger.gitlab.mr.changes_count = 8
    target.reviewLargePR();
    expect(dm.fail).toHaveBeenCalledTimes(0);
  })
})
