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

## Getting started

## Commands

```sh
docker pull ghcr.io/danger/danger-js:11.1.2
yarn danger:local
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
- https://github.com/jonathan-fielding/danger-js-example/pull/4/files
- [https://github.com/artsy/emission/blob/master/dangerfile.ts](https://github.com/artsy/emission/blob/master/dangerfile.ts)
- a lot in DSL [https://github.com/danger/danger-js/blob/main/dangerfile.ts](https://github.com/danger/danger-js/blob/main/dangerfile.ts)
- plugins [https://danger.systems/js/](https://danger.systems/js/)
- [https://github.com/rizalibnu/danger-plugin-pull-request](https://github.com/rizalibnu/danger-plugin-pull-request)
- [Official Docker creation](https://github.com/danger/danger-js/blob/main/.github/workflows/publish_package.yml)
- [Docker image](https://github.com/orgs/danger/packages/container/package/danger-js)
- [Docker images. Build Images](https://gitlab.com/gitlab-org/gitlab-build-images/-/blob/master/Dockerfile.danger)
- [Examples](https://snyk.io/advisor/npm-package/danger/functions/danger.markdown)
- [Example 6/10](https://github.com/artsy/metaphysics/blob/main/dangerfile.ts)
<!-- how to -->
- [Gitlab Templates](https://gitlab.com/gitlab-org/gitaly/-/blob/master/.gitlab-ci.yml)
