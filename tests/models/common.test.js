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
            state: '',
          }
        },
      },
    }
    target = new Common(dm.danger);
  })

//   it("should post message when reviewLargePR() and number of changes do exceed a threshold", () => {
//     dm.danger.gitlab.mr.changes_count = 15
//     target.reviewLargePR();
//     expect(dm.fail).toHaveBeenCalledTimes(1);
//   })

//   it("should not post message when reviewLargePR() and number of changes does not exceed a threshold", () => {
//     dm.danger.gitlab.mr.changes_count = 8
//     target.reviewLargePR();
//     expect(dm.fail).toHaveBeenCalledTimes(0);
//   })

  it("should message when jiraStoryMissing() and jira story is missing", () => {
    dm.danger.gitlab.mr.state = 'opened'
    dm.danger.gitlab.mr.title = 'Spread pod replicas across AZs'
    dm.danger.gitlab.mr.description = `
## Details
Follow up MR to implement spread of pods replicas over AZ
## Changes
+ creates unit tests to verify current values
## Checklist
- [x] Details section above is updated with relevant information
- [x] Read the Readme [readme](../../blob/master/README.md)
- [x] Confluence guidance [Deploy to K8s][confluence.k8s-deploy] is updated if required
- [ ] No changes have been made to the Gitlab pipeline
- [ ] Verified the plan job
[confluence.k8s-deploy]: https://hbidigital.atlassian.net/wiki/
    `
    target.jiraStoryMissing();
    expect(dm.warn).toHaveBeenCalledTimes(1);
    expect(dm.warn).toHaveBeenCalledWith(expect.stringContaining('there is a link provided'));
  })

  it("should message when jiraStoryMissing() and jira story is missing", () => {
    dm.danger.gitlab.mr.state = 'opened'
    dm.danger.gitlab.mr.title = 'Spread pod replicas across AZs'
    dm.danger.gitlab.mr.description = `
## Details
Follow up MR to implement spread of pods replicas over AZ
## Changes
+ creates unit tests to verify current values
## Checklist
- [x] Details section above is updated with relevant information
- [ ] Verified the plan job
[confluence.k8s-deploy]: https://hbidigital.atlassian.net/wiki/
Closes PTS-1478
    `
    target.jiraStoryMissing();
    expect(dm.warn).toHaveBeenCalledTimes(0);
  })

  it("should message when jiraStoryMissing() and jira story is provided", () => {
    dm.danger.gitlab.mr.state = 'opened'
    dm.danger.gitlab.mr.title = 'Spread pod replicas across AZs'
    dm.danger.gitlab.mr.description = `
## Details
Follow up MR to implement [PRS-389](https://hbidigital.atlassian.net/browse/PRS-389)
## Changes
+ creates unit tests to verify current values
## Checklist
- [x] Details section above is updated with relevant information
- [ ] Verified the plan job
[confluence.k8s-deploy]: https://hbidigital.atlassian.net/wiki/
Closes PTS-1478
    `
    target.jiraStoryMissing();
    expect(dm.warn).toHaveBeenCalledTimes(0);
  })

  it("should not post a message when jiraStoryMissing() and mr is closed", () => {
    dm.danger.gitlab.mr.state === 'closed'
    target.jiraStoryMissing();
    expect(dm.warn).toHaveBeenCalledTimes(0);
  })
})

