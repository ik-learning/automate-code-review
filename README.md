# automate-code-review

`added danger for checking commits compliance `

```
Danger is an extensible automated checker for merge requests. The rules are defined locally by code: it can inspect the current MR changes and perform any action based on whatever criteria you define. Start using Danger here to automatically apply labels based on the files which have been changed.
```

- [Confluence Guidance](https://hbidigital.atlassian.net/wiki/spaces/PAAS/pages/5712248833/Automate+Code+Review+with+Dagger+Guidance)
- [10% project](https://hbidigital.atlassian.net/wiki/spaces/PAAS/pages/5454364804/10+Time+Projects)
- [jira PAAS-1508](https://hbidigital.atlassian.net/browse/PAAS-1508)
- [Versioning](https://docs.gitlab.com/ee/development/cicd/templates.html#latest-version)

The intention of this project is to provide an automated way to rewier MRs

Here is a (non-exhaustive) list of the kinds of things Danger has been used for at GitLab so far:

- Coding style
- Database review
- Documentation review
- Merge request metrics
- Reviewer roulette
- Single codebase effort

```sh
docker pull registry.gitlab.com/hnbi/platform-as-a-service/test-projects/automate-code-review
```

---

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Contents

- [Getting started](#getting-started)
- [Commands](#commands)
    - [Run Danger file](#run-danger-file)
    - [Docs](#docs)
    - [Shared pipelines](#shared-pipelines)
- [SEcrets](#secrets)
- [Examples](#examples)
    - [How To](#how-to)
    - [Plugins](#plugins)
    - [Example MRs to Cover](#example-mrs-to-cover)
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

## Plugins

- [Danger Plugin Toolbox](https://www.npmjs.com/package/danger-plugin-toolbox)
- [Danger Plugin Jest](https://github.com/macklinu/danger-plugin-jest)
- [Danger Plugin TsLint](https://github.com/macklinu/danger-plugin-tslint)
- [Danger Plugin noTestsShortcuts](https://www.npmjs.com/package/danger-plugin-no-test-shortcuts)

## Testing

- [Artsy Emission](https://github.com/artsy/emission/blob/master/package.json)
- [Jest Testing with typescript](https://danger.systems/js/tutorials/transpilation.html)

### Run Danger file

```
npm install
```

### Supported Review Cases

#### Storate resources

- [X] Message for a manual action when specific resource to be deleted.

#### RDS

##### Modified

**Change Instance Class**

- [X] Request link to datadog, capacity planning or anything....

```diff
- instance_class = "db.t3.micro"
+ instance_class = "db.t3.small"
```

### Docs & Blogs

- [Emoji](https://github.com/ikatyang/emoji-cheat-sheet/blob/master/README.md#symbols)
- [Gitlab How to](https://danger.systems/js/usage/gitlab.html)
- [Danger Local](https://danger.systems/js/tutorials/fast-feedback.html)
- [Danger 5 minutes](https://medium.com/@ivan.ha/integrate-danger-js-in-5-minutes-55515bc5355d)
- [Gitlab source](https://github.com/danger/danger-js/blob/main/source/platforms/gitlab/GitLabGit.ts)
- [4/10: Gitalb Danger bot](https://docs.gitlab.com/ee/development/dangerbot.html)
- [4/10: Example Gitlab](https://github.com/cangSDARM/dangerjs-self-hosted-gitlab-sample/blob/master/dangerfile.js)
- [5/10: blog](https://prog.world/automate-review-selection-with-gitlab-ci-and-danger-js)
- [6/10: blog](https://labs.etsi.org/rep/help/development/dangerbot.md)
- [2/10: setup](https://www.bitrise.io/integrations/steps/danger)
- [6/10: hints](https://prog.world/automate-review-selection-with-gitlab-ci-and-danger-js/)
- [5/10: hints in ru](https://habr.com/ru/companies/vk/articles/672372/)

### Issues

- [Danger ts](https://github.com/danger/danger-js/issues/1152)
- [Danger ts](https://github.com/danger/danger-js/issues/1109)
- [Danger jest](https://github.com/danger/danger-js/pull/193/files)

## Secrets

- [Project Access Scope](https://docs.gitlab.com/ee/user/project/settings/project_access_tokens.html)

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
- [Docker image](https://github.com/orgs/danger/packages/container/package/danger-js)
- [Docker images. Build Images](https://gitlab.com/gitlab-org/gitlab-build-images/-/blob/master/Dockerfile.danger)
- [Examples](https://snyk.io/advisor/npm-package/danger/functions/danger.markdown)
- [Official Gitlab Setup 3/10](https://danger.systems/js/usage/gitlab.html)
- [Example 6/10](https://github.com/artsy/metaphysics/blob/main/dangerfile.ts)
- [Block code be used in Demo](https://yalantis.com/blog/code-review-via-gitlab-merge-requests-code-review-must/)

### How To

- [Gitlab Templates](https://gitlab.com/gitlab-org/gitaly/-/blob/master/.gitlab-ci.yml)
- [Danger Github Action](https://github.com/MeilCli/danger-action)
- [Gitlab Node API](https://github.com/jdalrymple/gitbeaker)

```
If you no longer need a global secondary index, you can delete it using the UpdateTable operation. You can delete only one global secondary index per UpdateTable operation. While the global secondary index is being deleted, there is no effect on any read or write activity in the parent table.
```

### Plugins

- [PR Higene](https://www.npmjs.com/package/danger-plugin-pr-hygiene)

### Example MRs to Cover

- [DynamoDB case](https://gitlab.com/HnBI/platform-as-a-service/infrastructure/-/merge_requests/3230/diffs)

## TODO && Supported Features

- [ ] Integrations
  + [ ] Integrate with notify to review an MR bot
- [ ] Recurring job
  + [ ] Iterate over every repository and review the MRs
- [ ] Docker tag. Embed tag as ARG.
- [ ] Use `TypeScript` instead of plain JS
  * Unit tests
- [X] Message 'apply after merge'
- [ ] Validate instance types `https://instances.vantage.sh/`
- [X] Ensure files has new line
- [X] Dynamodb
  * [X] Multiple GCI
    * [X] Hey, unfortunately only one GSI can be operated on at a time, otherwise AWS will complain.
    * [X] Cannot update GSI's properties other than Provisioned Throughput and Contributor Insights Specification
    * [X] Do not process `DynamoDB` logic when there is no change
    * [X] Billing mode suggestion.
    * [X] Investigate. Throwing an [error](https://gitlab.com/HnBI/platform-as-a-service/infrastructure/-/merge_requests/3434#note_1148024107)
  * [X] `non_key_attributes` modification
- [X] Please use the appropriate MR template, and populate with details and a jira ticket
- [X] Changelog is missing
- [X] Jira link is missing
- [X] Skip
  * [X] Do not run when `[skip ci]`.
  * [X] Skip MRs with label `renovate-bot`.
  * [X] Du not run when MR is `closed`.
  * [X] On MR description update.
- [ ] ElastiCache
  - [X] Validate node type exist with the link to `https://instances.vantage.sh/`
  - [ ] Validate specific values changed
- [ ] RDS
  * [ ] RDS engine version validation
    + [X] `postgres` version validation.
    + [X] `mysql` version validation.
    + [X] `rds` validate "valid_upgrade_targets" message
    + [X] Validate RDS instance class exist with the link to `https://instances.vantage.sh/`
    + [X] `gp2` to `gp3` migration proposal
    + [X] Instance class validation in `prod`.
    + [X] Instance class modified.
    + [X] Reminder to fix deleted resources.
  * [ ] Backup retention `│ Error: creating RDS DB Instance (restore to point-in-time) (search-category-api-v2): InvalidParameterValue: The specified instance cannot be restored to a time earlier than 2022-10-20T12:59:32Z because its backup retention period is set to 1 days.`
  * [ ] RDS outputs `engine_info.valid_upgrade_targets` have a look where there are available upgrade options
  + [ ] RDS/Dynamo DB deleted files -> ask PAAS to remove database
  * [ ] RDS message `Worth copying the config from another prod instance so that you get the correct settings for backups, multi-az and network connectivity` and validate `Things like multi_az: false, backup_retention_period: 1 and allowed_cidrs set to dev`
- [ ] RDS Aurora
   + [X] `aurora` initial validation
   + [X] `aurora` version validation
   + [X] `aurora` desired version validation
   + [X] `aurora` and `instance_type` validation
- [X] Flag on MR size
  * [X] Number of files > 10, should split MR probably.
  * [X] MR exceeded treshold.
- Sandbox
  * [ ](deleted) on deletion du not remove example. Consider to commment CI logic only. Remove resources from local.
- MSK/Kafka
  - [X] partial fix
  - [X] compare prefixes, e.g. where its new prefix of already exist
  - [ ] enforce single format e.g. `-` or `_`
    * (message) You also seem to be using a different format to the existing supply chain (ie. supply-chain- prefix, and hyphens), has your team chosen to change the format going forward?`
    * (message) First time team created a topic
  - [X] Added message for topic name consistency
  - [X] Kafka MR templates
  - [X] MSK MR `diff` instead of simple update
  - [X] Message `Please can you update the topic details section, and also put the topics in alphabetical order.
You also seem to be using a different format to the existing supply chain (ie. supply-chain- prefix, and hyphens), has your team chosen to change the format going forward?`
- [X] Labels
  * [X] Added label `danger-bot` on code review
- [ ] Messages
  * [ ] `message('Make sure to test your changes before moving your ticket to Code review.')`
  * [X] Pull Request size seems relatively large when `danger.gitlab.mr.changes_count: 100`
  * [ ] `warn("MR is classed as Work in Progress") if gitlab.mr_title.include? "Draft:"`
  * [X] `PaaS need to merge and apply changes.
  * [X] Message -> `On release, make sure `version` is updated in `Chart.yaml` file.`
- [ ] Slack
  * [ ] Request review in `paas-forum` or send and automated request to slack
  * [ ] Post message in slack channel with reviewer name
- [ ] Unit tests with fixtures. [Example](https://github.com/danger/danger-js/blob/main/source/platforms/gitlab/_tests/_gitlab_api.test.ts)
- [ ] Aurora
  * [ ] Supported engine versions [example](https://gitlab.com/HnBI/platform-as-a-service/infrastructure/-/jobs/3080939010)
- [ ] SSO
  * [ ] link to confluence
  * [ ] S3 buckets, link to explicit how to request
  * [ ] Admin or Full access is granted, flag it
- [ ] S3
  * [ ] Validate tags
  * [ ] Support MR templates for s3
  * [ ] Bucket deleted [PR example](https://gitlab.com/HnBI/platform-as-a-service/infrastructure/-/merge_requests/3474/diffs#note_1157452019)
- [ ] Sanity check and apply this repo https://hollandandbarrett.slack.com/archives/GKM7H90TH/p1666013132693499
- [ ] Web Hooks
  - [ ] [Automate/Simplify creation of webhooks](https://github.com/jdalrymple/gitbeaker/blob/master/packages/core/src/resources/ProjectHooks.ts)
    * [docs](https://docs.gitlab.com/ee/api/projects.html#add-project-hook)
  - [ ] Trigger a webhook programmatically for testing
- [ ] CHANGELOGs
  - [ ] `Changelog doesn't need to go via MR; just commit, tag and push` [mr](https://gitlab.com/HnBI/platform-as-a-service/k8s-cluster-config/-/merge_requests/432#note_1141930147)
  - [X] `This PR modifies multiple files but does not have the CHANGELOG updated.`
  - [X] `There should be no version until it is released, that is what the [Unreleased] section is for`
  - [X] `Could you add an entry to the "Unreleased" section of the changelog e.g. -Added|Changed-.`
- [X] Provide `CI_JOB_URL` in MR message
- [ ] Dependency update with Renovate
- [X] `k8s-deploy` specific review
  + [X] Test in test folder present.
  + [X] Message with explanation what is required to test changes.
