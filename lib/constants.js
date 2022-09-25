'use strict';

export const
  repo = danger.gitlab.metadata.repoSlug,
  prId = danger.gitlab.metadata.pullRequestID;

export const commitFiles = [
  ...danger.git.created_files,
  ...danger.git.deleted_files,
  ...danger.git.modified_files,
];

export const updatedFiles = [
  ...danger.git.created_files,
  ...danger.git.modified_files,
];
