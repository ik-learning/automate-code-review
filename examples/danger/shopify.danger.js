// https://www.npmjs.com/package/@shopify/danger

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.warnIfLargePR = exports.includeBackendTesting = exports.includeFrontendTesting = exports.includeIssueNumber = exports.skipForBots = exports.failIfStrict = void 0;
const micromatch = require("micromatch");
// Destructure PR information danger provides
function analyze(danger) {
  var _a, _b;
  const { commits = [], created_files: createdFiles = [], modified_files: modifiedFiles = [], deleted_files: deletedFiles = [] } = danger.git;
  const changedFiles = [...createdFiles, ...modifiedFiles];
  const frontendChanges = micromatch(changedFiles, [
    "web/**/*.(ts|tsx|scss)",
    "src/**/*.(ts|tsx|jsx)",
    "app/views/**/*.erb",
    "app/**/*.graphql",
    "public/**",
    "(scripts|server)/**"
  ]);
  const frontendTests = micromatch(changedFiles, ["web/**/*.test.(ts|tsx)", "web/**/*.spec.(ts|tsx)"]);
  const backendChanges = micromatch(changedFiles, [
    // All app/config changes
    "(app|config)/**/*.rb",
    // All DB changes
    "db/**",
    // Include rake tasks (aside from seeds, which are updated often in isolation for E2E tests)
    "lib/**/*!scenario.rake"
  ]);
  const backendTests = micromatch(changedFiles, ["test/**/*.rb"]);
  const infrastructureChanges = micromatch(changedFiles, [
    // Changes to configs and CI/CD
    "(infrastructure|config|.shopify-build|.spin)/**",
    // Almost all yml changes are infrastructure changes
    "**/*.yml"
  ]);
  const integrationTests = micromatch(changedFiles, ["cypress/**"]);
  const { user, title = "", body = "", additions, deletions, changed_files: numFilesChanged } = danger.github.pr;
  const { createOrAddLabel } = ((_a = danger === null || danger === void 0 ? void 0 : danger.github) === null || _a === void 0 ? void 0 : _a.utils) || {};
  const { labels = [] } = ((_b = danger === null || danger === void 0 ? void 0 : danger.github) === null || _b === void 0 ? void 0 : _b.issue) || {};
  const commitMessages = commits.map((commit) => commit.message);
  const labelNames = labels.map((label) => label.name);
  const isBot = (user === null || user === void 0 ? void 0 : user.type) === "Bot";
  const labeledAsCannotTest = labelNames.some((label) => label.toLowerCase() === "cannot test");
  const labeledAsHotfix = title.toLowerCase().includes("hotfix") ||
    labelNames.some((label) => label.toLowerCase() === "hotfix") ||
    commitMessages.some((msg) => msg.toLowerCase().includes("hotfix"));
  const hasIssueNumber = !body.includes("Closes #0000") && /#[0-9]{4}$/.test(body);
  /** A PR is held to strict standards (failing on most violations) if it's not a hotfix or labeled as an edge case */
  const isStrict = !labeledAsHotfix && !labeledAsCannotTest;
  return {
    changedFiles,
    frontendChanges,
    frontendTests,
    backendChanges,
    backendTests,
    infrastructureChanges,
    integrationTests,
    numFilesChanged,
    labels,
    commitMessages,
    labelNames,
    isBot,
    labeledAsCannotTest,
    labeledAsHotfix,
    hasIssueNumber,
    isStrict
  };
}
exports.default = analyze;
/** Utility that only blocks a PR if it's not labeled as a hotfix via GH title, labels, or commit messages, etc */
const failIfStrict = (danger, msg, file, line) => {
  const { isStrict } = analyze(danger);
  if (isStrict) {
    fail(msg + file + line);
  }
  else {
    warn(msg + file + line);
  }
};
exports.failIfStrict = failIfStrict;
// ...
const skipForBots = (danger) => {
  const { isBot } = analyze(danger);
  // Exit early if this PR was made by a bot
  if (isBot)
    process.exit(0);
};
exports.skipForBots = skipForBots;
const includeIssueNumber = (danger) => {
  const { hasIssueNumber } = analyze(danger);
  // Nit: include an issue number
  if (!hasIssueNumber) {
    warn(":ticket: Please include an issue number in the PR body");
  }
};
exports.includeIssueNumber = includeIssueNumber;
const includeFrontendTesting = (danger, modifiedFilesThreshold = 2) => {
  const { frontendChanges, frontendTests, integrationTests } = analyze(danger);
  const { createOrAddLabel } = danger.github.utils;
  // Rule: FE changes should have tests / integration coverage
  if (frontendChanges.length > modifiedFilesThreshold) {
    if (frontendTests.length || integrationTests.length) {
      message(`:tada: Thanks for including ${frontendTests.length + integrationTests.length} tests for our FE!`);
      createOrAddLabel({
        color: "#0E8A16",
        description: "Tests included",
        name: "Has Tests"
      });
    }
    else {
      (0, exports.failIfStrict)(danger, `:globe_with_meridians: ${frontendChanges.length} frontend files changed, but tests were not included.`);
    }
  }
};
exports.includeFrontendTesting = includeFrontendTesting;
const includeBackendTesting = (danger, modifiedFilesThreshold = 2) => {
  const { backendChanges, backendTests, integrationTests } = analyze(danger);
  const { createOrAddLabel } = danger.github.utils;
  // Rule: BE changes should have tests / integration coverage
  if (backendChanges.length > modifiedFilesThreshold) {
    if (backendTests.length || integrationTests.length) {
      message(`:tada: Thanks for including ${backendTests.length + integrationTests.length} tests for our BE!`);
      createOrAddLabel({
        color: "#0E8A16",
        description: "Tests included",
        name: "Has Tests"
      });
    }
    else {
      (0, exports.failIfStrict)(danger, `:satellite: ${backendChanges.length} backend files changed, but tests were not included.`);
    }
  }
};
exports.includeBackendTesting = includeBackendTesting;
const warnIfLargePR = (danger, bigPrThreshold = 200) => {
  const { changedFiles } = analyze(danger);
  // Nit: Large PRs should be broken down
  if (changedFiles.length >= 200) {
    warn(":warning: This PR is large. Please consider breaking it up into smaller chunks.");
  }
};
exports.warnIfLargePR = warnIfLargePR;
