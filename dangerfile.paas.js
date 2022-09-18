'use strict';

// const { danger, warn, message, markdown } = require('danger')
const match = require('micromatch');

// helpers & utils
const
  { contains, hclToJson } = require("./lib/utils");

const repo = danger.gitlab.metadata.repoSlug;
const commitFiles = [
  ...danger.git.created_files,
  ...danger.git.deleted_files,
  ...danger.git.modified_files,
];
const updatedFiles = [
  ...danger.git.created_files,
  ...danger.git.modified_files,
];

// markdown("Hey there! Thanks for contributing a PR to a repo! 🎉")

// console.log(danger.gitlab)
// console.log(danger)
// No PR is too small to include a description of why you made a change
// if (danger.gitlab.mr.body.length < 10) {
//   warn('Please include a description of your PR changes.');
// }

// Check that someone has been assigned to this PR
// if (danger.gitlab.mr.assignee === null) {
//    warn('Please assign someone to merge this PR, and optionally include people who should review.');
// }
// console.log(danger.git)

const ensureFileHasNewline = (files) => {
  // Always ensure all files has newlines
  files.forEach(file => {
    danger.git.diffForFile(file).then((el) => {
      if (el.diff.includes('No newline at end of file')) {
        warn(`📂 ${file}. ➡️  No newline at end of file.`);
      }
    })
  });
}

const conditionsToTriggerApply = [
  'terraform', '.gitlab-ci.yml', 'environments'
]

const adviseManualApplyMessage = files => {
  // manual apply advice should be added to an MR
  const result = files.filter((val) => {
    return conditionsToTriggerApply.some(el => val.includes(el))
  });
  if (result.length > 0) {
    message("🛠️  You'll need to run the manual apply job when changes merged...")
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
      // forEach??
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
const rdsPostgres = {
  'engine': 'postgres',
  'engine_version': '14.3',
  'family': 'postgres14'
}
const rdsRecommendInstanceTypesInDev = [
  'db.t3.micro', 'db.t3.small'
]


// const ensureRDSCreationValidated = async (files) => {
async function ensureRDSCreationValidated() {
  // TODO: support mysql, aurora
  const tfvars = danger.git.fileMatch("**/rds/**/*.tfvars");
  const hcl = danger.git.fileMatch("**/rds/**/*.hcl");
  const tfvarsCreated = tfvars.getKeyedPaths().created;

  if (tfvarsCreated.length !== hcl.getKeyedPaths().created.length) {
    const details = [
      "*No `*.hcl` file detected*. Create a `terragrunt.hcl` file next to `*.tfvars` with the below **exact** content: <br>\n",
      "```\n",
      "include \"common\" {\r\n",
      " path = find_in_parent_folders(\"common.hcl\")\r\n",
      "}\n",
      "```"
    ].join("")
    warn(details)
  }
  if (tfvarsCreated.length > 1) {
    message(`🤖 Do you need **prod** immediately too, or can it be split out and deployed later (ie. will you be using it today?).`);
  }

  if (tfvars.created) {
    // validate instance class in dev
    match(tfvarsCreated, ['**/dev/**']).forEach(async file => {
      const diff = await danger.git.diffForFile(file);
      const data = hclToJson(diff.after);
      let { instance_class, engine, engine_version } = data.rds_config.instance_config
      if (engine === 'postgres' && !match.isMatch(instance_class, rdsRecommendInstanceTypesInDev)) {
        warn(`📂 ${file}. ➡️  (💸 saving) In \`dev\` environment instance class \`${instance_class}\` not recommended. Consider smaller sizes \`${rdsRecommendInstanceTypesInDev}\` ...`);
      }
      if (engine !== 'postgres') {
        console.log(`mr review weith \`${engine}\` is  not yet supported.`)
      }
    });
  }

  if (tfvars.created) {
    // make sure latest version in use dev|prod
    tfvarsCreated.forEach(async file => {
      const diff = await danger.git.diffForFile(file);
      const data = hclToJson(diff.after);
      let { engine, engine_version, family } = data.rds_config.instance_config
      if (engine === 'postgres' && engine_version !== rdsPostgres.engine_version && family !== rdsPostgres.family ) {
        warn(`📂 ${file}. ✏️  is there is a reason to created outdated rds. \`proposed: { family:${rdsPostgres.family}, engine_version:${rdsPostgres.engine_version} }, current: { family:${family}, engine_version:${engine_version} } \``)
      }
      if (engine !== 'postgres') {
        console.log(`mr review weith \`${engine}\` is  not yet supported.`)
      }
    })

  }
}

// changelog
const shouldChanelogBeModified = [
  'platform-as-a-service/k8s-cluster-config'
]
const changelogSync = async () => {
  // TODO: revisit the check for changelog repo not required
  let changedChangelog = danger.git.modified_files.includes('CHANGELOG.md')
  if (!changedChangelog) {
    shouldChanelogBeModified.forEach(el => {
      if (danger.gitlab.metadata.repoSlug.includes(el)) {
        warn('This PR modified important files but does not have `Added|Changed` entry in the CHANGELOG.');
      }
    });
  }
}

const shouldTemplateBeEnforced = [
  'terraform', 'environments'
]
const mrTemplates = {
  'rds': {
    'created': 'Create RDS instance.md',
    'modified': 'to-do'
  },
  'dynamodb': {
    'created': 'todo',
    'modified': 'Update DynamoDB Table.md'
  },
  'appconfig': {
    'created': 'todo',
    'modified': 'todo',
    'deleted': 'todo',
  }
};

const templateShouldBeEnforced = async (files, templates) => {
  const tfvars = danger.git.fileMatch("**.tfvars");
  const tfvarsCreated = tfvars.getKeyedPaths().created;
  const tfvarsModified = tfvars.getKeyedPaths().modified;
  const tfvarsDeleted = tfvars.getKeyedPaths().deleted;

  let template = {}
  // TODO: support Updated and Deleted!!!
  let templateNotInUse = !contains(danger.gitlab.mr.description, ['## Checklist', 'Created']);

  // created
  if (templateNotInUse && tfvarsCreated.length > 0) {
    tfvarsCreated.forEach(file => {
      Object.keys(templates).some(el => {
        if (file.includes(el)) {
          template[el] = 'created'
        }
      });
    })
  }
  // updated
  if (templateNotInUse && tfvarsModified.length > 0) {
    let action = 'modified'
    // todo
  }
  // deleted
  if (templateNotInUse && tfvarsDeleted.length > 0) {
    console.log('deleted')
    let action = 'deleted'
    // todo
  }

  if (Object.keys(template).length === 1) {
    Object.entries(template).forEach(([key, value]) => {
      const mrTemplate = templates[key][value];
      const mrTemplateWithoutExt = mrTemplate.split('.')[0];
      const sanitized = mrTemplate.split(" ").join("%20");
      const link = `https://gitlab.com/${repo}/-/blob/master/.gitlab/merge_request_templates/${sanitized}`

      warn(`Please use the appropriate MR [${mrTemplateWithoutExt}](${link}), and populate with details and a jira ticket...`)
    });
  } else if (Object.keys(template).length > 1) {
    warn(`multiple resources 'created|modified|deleted' in a single MR.`)
  }
}

// template

// ensureDynamoDBSingleKeyModification(updatedFiles);
// ensureRDSCreationValidated(danger.git.created_files)

const commonChecks = source => {
  ensureFileHasNewline(updatedFiles);
}

const infraChecks = async () => {
  adviseManualApplyMessage(commitFiles);
  await ensureRDSCreationValidated();
  await templateShouldBeEnforced(commitFiles, mrTemplates);
}

// async function runAsync() {
//   await ensureRDSCreationValidated();
//   // await changelogSync();
//   await templateShouldBeEnforced(commitFiles, mrTemplates);
// }

// danger.github.pr.body.includes("[skip ci]")

module.exports = {
  commonChecks,
  infraChecks,
};
