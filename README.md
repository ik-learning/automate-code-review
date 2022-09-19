# automate-code-review

- [10% project](https://hbidigital.atlassian.net/wiki/spaces/PAAS/pages/5454364804/10+Time+Projects)
- [jira PAAS-1508](https://hbidigital.atlassian.net/browse/PAAS-1508)

Here is a (non-exhaustive) list of the kinds of things Danger has been used for at GitLab so far:

- Coding style
- Database review
- Documentation review
- Merge request metrics
- Reviewer roulette
- Single codebase effort

---

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Contents

- [Getting started](#getting-started)
- [Commands](#commands)
    - [Run Danger file](#run-danger-file)
    - [Docs](#docs)
- [Examples](#examples)
    - [How To](#how-to)
    - [Plugins](#plugins)
- [TODO && Supported Features](#todo-&&-supported-features)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

---

## Getting started

## Commands

```sh
docker pull ghcr.io/danger/danger-js:11.1.2
yarn danger:local
# locally test
yarn danger pr $DANGER_PR_URL
yarn danger pr --removePreviousComments $DANGER_PR_URL
DANGER_TEST_PR='2' yarn danger ci
```

### Run Danger file

```
npm install
```

### Docs

- [Gitlab How to](https://danger.systems/js/usage/gitlab.html)
- [Danger bot](https://docs.gitlab.com/ee/development/dangerbot.html)
- [Danger Local](https://danger.systems/js/tutorials/fast-feedback.html)
- [Danger 5 minutes](https://medium.com/@ivan.ha/integrate-danger-js-in-5-minutes-55515bc5355d)
- [Gitlab source](https://github.com/danger/danger-js/blob/main/source/platforms/gitlab/GitLabGit.ts)
- [7/10 Gitlab](https://github.com/cangSDARM/dangerjs-self-hosted-gitlab-sample/blob/master/dangerfile.js)
- [Emojies](https://github.com/ikatyang/emoji-cheat-sheet/blob/master/README.md#symbols)
- [5/10 blog](https://prog.world/automate-review-selection-with-gitlab-ci-and-danger-js)

```yaml
 include:
   - project: 'gitlab-org/quality/pipeline-common'
     file:
       - '/ci/danger-review.yml'
     rules:
       - if: $CI_SERVER_HOST == "gitlab.com"
```

Example shared https://gitlab.com/HnBI/fulfilment/test-project/-/blob/master/.gitlab-ci.yml

## Examples

- [https://github.com/artsy/artsy.github.io/blob/main/Dangerfile](https://github.com/artsy/artsy.github.io/blob/main/Dangerfile)
- [https://github.com/artsy/eigen/blob/main/dangerRules/useWebPs.tests.ts](https://github.com/artsy/eigen/blob/main/dangerRules/useWebPs.tests.ts)
- [https://github.com/artsy/eigen/blob/main/dangerfile.ts](https://github.com/artsy/eigen/blob/main/dangerfile.ts)
- [https://github.com/realm/jazzy/blob/master/Dangerfile](https://github.com/realm/jazzy/blob/master/Dangerfile)
- [https://github.com/samdmarshall/danger/blob/master/Dangerfile](https://github.com/samdmarshall/danger/blob/master/Dangerfile)
- [https://github.com/artsy/emission/blob/master/dangerfile.ts](https://github.com/artsy/emission/blob/master/dangerfile.ts)
- a lot in DSL [https://github.com/danger/danger-js/blob/main/dangerfile.ts](https://github.com/danger/danger-js/blob/main/dangerfile.ts)
- plugins [https://danger.systems/js/](https://danger.systems/js/)
- [https://github.com/rizalibnu/danger-plugin-pull-request](https://github.com/rizalibnu/danger-plugin-pull-request)
- [Official Docker creation](https://github.com/danger/danger-js/blob/main/.github/workflows/publish_package.yml)
- [Docker image](https://github.com/orgs/danger/packages/container/package/danger-js)
- [Docker images. Build Images](https://gitlab.com/gitlab-org/gitlab-build-images/-/blob/master/Dockerfile.danger)
- [Examples](https://snyk.io/advisor/npm-package/danger/functions/danger.markdown)
- [Example 6/10](https://github.com/artsy/metaphysics/blob/main/dangerfile.ts)

### How To

- [Gitlab Templates](https://gitlab.com/gitlab-org/gitaly/-/blob/master/.gitlab-ci.yml)
- [Danger Github Action](https://github.com/MeilCli/danger-action)
- [Gitlab Node API](https://github.com/jdalrymple/gitbeaker)

### Plugins

- [PR Higene](https://www.npmjs.com/package/danger-plugin-pr-hygiene)

## TODO && Supported Features

- [X] Message 'apply after merge'
- [X] Ensure files has new line
- [X] Multiple GCI
  * [X] Hey, unfortunately only one GSI can be operated on at a time, otherwise AWS will complain.
- [X] RDS version validation
- [X] Please use the appropriate MR template, and populate with details and a jira ticket
- [X] Changelog is missing
- Please can you update the topic details section, and also put the topics in alphabetical order.
- Jira link is missing
- Du not ren when `[skip ci]
- skip some suggestions for renovate bot
- RDS support deleted files with message
- Gitlab suggest a change in an MR
- RDS/Dynamo DB deleted files -> ask PAAS to remove database
- Sandbox (deleted) on deletion du not remove example. Consider to commment CI logic only. Remove resources from local.
- Unit tests
- Kafka aplhabetic
  - [X] partial fix
  - [ ] compare prefixes, e.g. where its new prefix of already exist
  - [ ] enforce single format e.g. `-` or `_`
  - [ ] msk MR `diff` instead of simple update
  - message `Please can you update the topic details section, and also put the topics in alphabetical order.
You also seem to be using a different format to the existing supply chain (ie. supply-chain- prefix, and hyphens), has your team chosen to change the format going forward?`
- Kafka MR templates
