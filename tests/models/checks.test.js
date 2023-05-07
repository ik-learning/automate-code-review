jest.mock("danger", () => jest.fn())
const chainsmoker = require('../../node_modules/danger/distribution/commands/utils/chainsmoker.js')

const danger = require("danger");
let dm = danger;

global.message = (input) => {
  dm.message(input)
}

const { Checks } = require("../../src/models");
let target;

describe("test models/k8s.js ...", () => {
  beforeEach(() => {
    global.message = (input) => dm.message(input);
    dm = {
      message: jest.fn(),
      danger: {
        git: { },
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
    target = new Checks(dm.danger);
  })

  it("should skipReview() when mr is not opened", () => {
    dm.danger.gitlab.mr.state = 'merged';
    expect(target.skipReview()).toBeTruthy();
  })

  it("should skipReview() when mr approved", () => {
    dm.danger.gitlab.mr.state = 'opened';
    dm.danger.gitlab.approvals.approved = true
    expect(target.skipReview()).toBeTruthy();
  })

  it("should skipReview() when mr title contains [skip ci]", () => {
    dm.danger.gitlab.mr.state = 'opened';
    dm.danger.gitlab.approvals.approved = false
    dm.danger.gitlab.mr.title = 'Set retention period to 40 days [skip ci]'
    expect(target.skipReview()).toBeTruthy();
  })

  it("should skipReview() when mr opened by 'renovate-bot'", () => {
    dm.danger.gitlab.mr.state = 'opened';
    dm.danger.gitlab.approvals.approved = false
    dm.danger.gitlab.mr.title = 'Set retention period to 40 days'
    dm.danger.gitlab.mr.labels = ['renovate-bot']
    expect(target.skipReview()).toBeTruthy();
  })

  it("should skipReview() when mr opened but outdated", () => {
    dm.danger.gitlab.mr.state = 'opened';
    dm.danger.gitlab.approvals.approved = false
    dm.danger.gitlab.mr.title = 'Set retention period to 40 days'
    dm.danger.gitlab.mr.labels = ['review-bot']
    dm.danger.gitlab.commits = [
      {
        short_id: '4a4ce886',
        created_at: '2023-03-14T13:13:08.000Z',
      }
    ]
    expect(target.skipReview()).toBeTruthy();
  })

  it("should skipReview() when latest commit contains [skip ci]", () => {
    dm.danger.gitlab.mr.state = 'opened';
    dm.danger.gitlab.approvals.approved = false
    dm.danger.gitlab.mr.title = 'Set retention period to 40 days'
    dm.danger.gitlab.mr.labels = []
    dm.danger.gitlab.commits = [
      {
        short_id: '4a4ce886',
        created_at: '2023-03-14T13:13:08.000Z',
        title: 'Update retention period to 40 days [skip ci]',
      },
      {
        short_id: '4a4ce876',
        created_at: '2023-03-11T13:11:08.000Z',
        title: 'Update retention period to 40 days',
      }
    ]
    expect(target.skipReview()).toBeTruthy();
  })

  it("should not skipReview()", () => {
    dm.danger.gitlab.mr.state = 'opened';
    dm.danger.gitlab.approvals.approved = false
    dm.danger.gitlab.mr.title = 'Set retention period to 40 days'
    dm.danger.gitlab.mr.labels = []
    dm.danger.gitlab.commits = [
      {
        short_id: '4a4ce886',
        created_at: '2023-03-14T13:13:08.000Z',
        title: 'Update retention period to 40 days',
      },
      {
        short_id: '4a4ce876',
        created_at: '2023-03-11T13:11:08.000Z',
        title: 'Update retention period to 40 days',
      }
    ]
    expect(target.skipReview()).toBeFalsy();
  })

})
