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
    global.markdown = (input) => dm.markdown(input);

    dm = {
      message: jest.fn(),
      warn: jest.fn(),
      fail: jest.fn(),
      markdown: jest.fn(),
      danger: {
        git: {
          fileMatch: jest.fn(),
          diffForFile: jest.fn(),
        },
        gitlab: {
          api: {
            MergeRequests: {
              edit: jest.fn(),
            }
          },
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

  it("should not post a message when mrInfoCheck()", () => {
    dm.danger.gitlab.mr.title = 'The fifty mannequin heads floating in the pool'
    dm.danger.gitlab.mr.description = 'Sometimes you have to just give up and win by cheating.'
    target.mrInfoCheck();
    expect(dm.warn).toHaveBeenCalledTimes(0);
  })

  it("should post a message when mrInfoCheck() description is short", () => {
    dm.danger.gitlab.mr.title = 'The fifty mannequin heads floating in the pool'
    dm.danger.gitlab.mr.description = 'Follow up MR'
    target.mrInfoCheck();
    expect(dm.warn).toHaveBeenCalledTimes(1);
    expect(dm.warn).toHaveBeenCalledWith(expect.stringContaining('sufficiently accurate'));
  })

  it("should post a message when mrInfoCheck() and title contains WIP", () => {
    dm.danger.gitlab.mr.title = 'WIP: The fifty mannequin heads floating in the pool'
    dm.danger.gitlab.mr.description = 'Sometimes you have to just give up and win by cheating.'
    target.mrInfoCheck();
    expect(dm.warn).toHaveBeenCalledTimes(1);
    expect(dm.warn).toHaveBeenCalledWith(expect.stringContaining('rename WIP part'));
  })

  it("should post a message when welcomeMsg() and link is provided", () => {
    target.welcomeMsg({ url: "https://google.com" });
    expect(dm.markdown).toHaveBeenCalledTimes(1);
    expect(dm.markdown).toHaveBeenCalledWith(expect.stringContaining('share feedback and etc'));
  })

  it("should post a message when welcomeMsg() and link is not provided", () => {
    target.welcomeMsg();
    expect(dm.markdown).toHaveBeenCalledTimes(1);
    expect(dm.markdown).toHaveBeenCalledWith(expect.stringContaining('contributing an MR'));
  })

  it.each([
    [1, { url: "https://google.com" }, 'share feedback and etc'],
    [1, {}, 'contributing an MR'],
    [1, null, 'contributing an MR'],
  ])('should consume welcomeMsg()', (times, input, msg) => {
    target.welcomeMsg(input);
    expect(dm.markdown).toHaveBeenCalledTimes(times);
    expect(dm.markdown).toHaveBeenCalledWith(expect.stringContaining(msg));
  });

  it("should update labels when addLabels(input)", () => {
    dm.danger.gitlab.mr.labels = ["one", "two"];
    dm.danger.gitlab.metadata.repoSlug = 'test/repo'
    dm.danger.gitlab.api.MergeRequests.edit = jest.fn();
    return target.addLabels(["two", "four"]).then(() => {
      expect(dm.danger.gitlab.api.MergeRequests.edit).toHaveBeenCalledTimes(1);
      expect(dm.danger.gitlab.api.MergeRequests.edit).toHaveBeenCalledWith('test/repo', expect.anything(), { "labels": ["one", "two", "two", "four"] });
    })
  })

  it("should not update labels when addLabels(input)", () => {
    dm.danger.gitlab.mr.labels = ["one", "two"];
    dm.danger.gitlab.metadata.repoSlug = 'test/repo'
    dm.danger.gitlab.api.MergeRequests.edit = jest.fn();
    return target.addLabels(["one"]).then(() => {
      expect(dm.danger.gitlab.api.MergeRequests.edit).toHaveBeenCalledTimes(0);
    })
  })

  it("should message when ensureFileHasNewline() and no new line present", () => {
    dm.danger.git.created_files = ['requirements.txt'];
    dm.danger.git.modified_files = [];
    dm.danger.git.diffForFile = async (file) => {
      return setUpTestScenarioObject('models/__fixtures__/common/no-newline.diff.json');
    }
    return target.ensureFileHasNewline().then(() => {
      expect(dm.warn).toHaveBeenCalledTimes(1);
      expect(dm.warn).toHaveBeenCalledWith(expect.stringContaining('No newline at end of file'));
    })
  })

  it("should not message when ensureFileHasNewline() and new line present", () => {
    dm.danger.git.created_files = ['requirements.txt'];
    dm.danger.git.modified_files = [];
    dm.danger.git.diffForFile = async (file) => {
      return setUpTestScenarioObject('models/__fixtures__/common/newline.diff.json');
    }
    return target.ensureFileHasNewline().then(() => {
      expect(dm.warn).toHaveBeenCalledTimes(0);
    })
  })
})
