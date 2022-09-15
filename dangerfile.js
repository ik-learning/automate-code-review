const {danger, warn} = require('danger')

// console.log(danger.gitlab)
// console.log(danger)
// No PR is too small to include a description of why you made a change
// if (danger.gitlab.mr.body.length < 10) {
//   warn('Please include a description of your PR changes.');
// }

// danger.gitlab.mr = exactly the MR JSON from the API
// danger.gitlab.utils = util funcs
// danger.gitlab.commits = commits from the GitLab API

// // Check that someone has been assigned to this PR
// if (danger.gitlab.mr.assignee === null) {
//    warn('Please assign someone to merge this PR, and optionally include people who should review.');
// }
// console.log(danger.git)

const commitFiles = [
  ...danger.git.created_files,
  ...danger.git.deleted_files,
  ...danger.git.modified_files,
];

const updatedFiles = [
  ...danger.git.created_files,
  ...danger.git.modified_files,
];

// console.log(updatedFiles)

const ensureFileHasNewline = (files) => {
  // Always ensure all files has newlines
  for (let file of files) {
    danger.git.diffForFile(file).then((el) => {
      if (el.diff.includes('No newline at end of file')) {
        warn(`📂 ${file}. ➡️  No newline at end of file.`);
      }
    })
  }
}

ensureFileHasNewline(updatedFiles);

