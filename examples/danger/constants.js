const { REVIEW_ROULETTE_LABEL, REVIEW_ROULETTE_MIN_APPROVERS } = process.env;
const { mr, approvals, api, metadata } = danger.gitlab;
const { repoSlug, pullRequestID } = metadata;
const { iid, author, reviewers, web_url, title, description, labels, draft } = mr as MR;
const { suggested_approvers, project_id, approved_by, approvals_required } = approvals as Approvals;
const mrLink = `[${repoSlug}!${pullRequestID}](${web_url})`;
const approvalsCount = approvals_required || Number(REVIEW_ROULETTE_MIN_APPROVERS);
