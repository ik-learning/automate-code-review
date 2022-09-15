const { danger, warn, message } = require('danger')

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

// engine_version, family
const rdsPostgresConditionsToLookAfter = {
  'engine': 'postgres',
  'engine_version': '14.3',
  'family': 'postgres14'
}
const rdsRecommendetInstanceTypesInDev = [
  'db.t3.micro', 'db.t3.small'
]
const ensureRDSCreationValidated = (files) => {
  // TODO: support mysql
  // TODO: validate version
  const tfvars = danger.git.fileMatch("**/rds/**/*.tfvars")
  const hcl = danger.git.fileMatch("**/rds/**/*.hcl")
  if (tfvars.getKeyedPaths().created.length != hcl.getKeyedPaths().created.length) {
    const details = [
      "*No hcl file detected*. Create a `terragrunt.hcl` file next to `*.tfvars` with the below **exact** content: <br>",
      "<code>",
      "include \"common\" {\r\n",
      "  path = find_in_parent_folders(\"common.hcl\")\r\n",
      "}",
      "</code>"
    ].join("")
    markdown(details)
  }
  if (tfvars.getKeyedPaths().created.length > 1) {
    message(`(Potential improvement) Do you need **prod** immediately too, or can it be split out and deployed later (ie. will you be using it today)..`);
  }
  const rds = {
    'engine_version': '',
    'family': ''
  }

  if (tfvars.created) {
    // validate instance class
    const createdFiles = tfvars.getKeyedPaths().created;
    createdFiles.filter((el) => el.includes('/dev/')).map((el) => {
      let notRecommendedInstanceClass = true;
      let instance_class;

      danger.git.structuredDiffForFile(el).then((e) => {
        for (let i of e.chunks) {
          for (let c of i.changes) {
            if (c.content.includes('instance_class')) {
              instance_class = c.content.split(" ").at(-1)
              for (let rds of rdsRecommendetInstanceTypesInDev) {
                if (instance_class.includes(rds)) {
                  notRecommendedInstanceClass = false;
                  break;
                }
              }
              if (notRecommendedInstanceClass) {
                warn(`📂 ${el}. ➡️  (Potential cost saving) In dev environment instance class ${instance_class} not recommended. Consider smaller sizes "${rdsRecommendetInstanceTypesInDev}" ...`);
              }
              break;
            }
          }
        }
      });
      return
    })
    // for (let f of tfvars.getKeyedPaths().created) {
    //   danger.git.structuredDiffForFile(f).filter.then((el) => {
    //     console.l
    //     // for (let i of el.chunks) {
    //     //   console.log(i)
    //     // }
    //   })
    // }
    // validate engine version
    // for (let f of tfvars.getKeyedPaths().created) {
    //   danger.git.structuredDiffForFile(f).then((el) => {
    //     for (let i of el.chunks) {
    //       console.log(i)
    //     }
    //   })
    // }
  }
  // const app = danger.git.fileMatch("src/**/*.ts")
  // const tests = danger.git.fileMatch("*/__tests__/*")
  // console.log(tfvars)
}

ensureFileHasNewline(updatedFiles);
adviseManualApplyShouldBeAddedWhenFilesChanged(commitFiles);
ensureDynamoDBSingleKeyModification(updatedFiles);
ensureRDSCreationValidated(danger.git.created_files)
