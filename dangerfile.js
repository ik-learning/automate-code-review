const { danger, warn } = require('danger')

markdown("Hey there! Thanks for contributing a PR to a repo! 🎉")

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

const conditionsToTriggerApply = [
  'terraform', '.gitlab-ci.yml', 'environments'
]

const adviseManualApplyShouldBeAddedWhenFilesChanged = (files) => {
  // manual apply advice should be added to a file
  const result = files.filter((val) => {
    return conditionsToTriggerApply.some(el => val.includes(el))
  });
  if (result.length > 0) {
    console.log(`files that must te applied ${result}`);
    message("You'll need to run the manual apply job when changes merged...")
  }
}

// dynamodb
const conditionsWhenMultipleDynamoKeysModified = [
  'name', 'hash_key', 'projection_type', 'range_key', 'read_capacity', 'write_capacity'
]
const ensureDynamoDBSingleKeyModification = (files) => {
  // TODO: consider what to do with LSI?
  // TODO: consider multiple use caess e.g. keys removed, added and modified
  // TODO: could be simplified e.g. calculate number of '{' and '}'
  const result = files.filter((val) => {
    return val.includes('dynamodb')
  });
  for (let file of result) {
    danger.git.structuredDiffForFile(file).then((el) => {
      if (el.chunks.length > 1) {
        console.log('potentially multiple changes in the dynamodb file')
      }
      let lastEl = '';
      let result = 0
      const keys = {
        'name': 0,
        'hash_key': 0,
        'projection_type': 0,
        'range_key': 0,
        'read_capacity': 0,
        'write_capacity': 0
      }
      for (let c of el.chunks) {
        for (let x of c.changes) {
          let sanitized = x.content.replace(/[^a-zA-Z_+-]/g, "");
          // console.log(sanitized)
          for (let el of conditionsWhenMultipleDynamoKeysModified) {
            if (sanitized.includes(el) && lastEl !== el) {
              keys[el] += 1
              lastEl = el
              // console.log(`${sanitized} -> ${el}`)
              if (keys[el] >= 2) {
                result += 1
              }
              break;
            }
          }
        }
      }
      if (result >= 2) {
        warn(`📂 ${file}. ➡️  (Potential issue) Only one GSI can be operated on at a time, otherwise AWS will complain..`);
      }
    })
  }
}

ensureFileHasNewline(updatedFiles);
adviseManualApplyShouldBeAddedWhenFilesChanged(commitFiles);
ensureDynamoDBSingleKeyModification(updatedFiles);
// console.log(danger.git)

