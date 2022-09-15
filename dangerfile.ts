import { danger, warn, fail, message, markdown } from 'danger';

const reviewLargePR = () => {
  const bigPRThreshold = 300;
  if (danger.github.pr.additions + danger.github.pr.deletions > bigPRThreshold) {
    warn(`:exclamation: Pull Request size seems relatively large. If Pull Request contains multiple changes, split each into separate PR for faster, easier review.`);
  }
}
const ensurePRHasAssignee = () => {
  // Always ensure we assign someone, so that our Slackbot can do its work correctly
  if (danger.github.pr.assignee === null) {
    fail("Please assign someone to merge this PR, and optionally include people who should review.")
  }
}

if (danger.gitlab.mr.title.includes("WIP")) {
  warn("PR is considered WIP")
}

reviewLargePR();
ensurePRHasAssignee();

const pr = danger.github.pr
console.log(pr)

const { additions = 0, deletions = 0 } = danger.github.pr
message(`:tada: The PR added ${additions} and removed ${deletions} lines.`)

markdown("*Markdown* is also **supported**")
