'use strict';

// Danger is accessible globally
const match = require('micromatch');
const array = require('lodash/array');

// helpers & utils
const
  { contains, hclToJson, getHashDifference } = require("./utils");

const
  repo = danger.gitlab.metadata.repoSlug,
  prId = danger.gitlab.metadata.pullRequestID;

const commitFiles = [
  ...danger.git.created_files,
  ...danger.git.deleted_files,
  ...danger.git.modified_files,
];
const updatedFiles = [
  ...danger.git.created_files,
  ...danger.git.modified_files,
];

// todo: wrap into some sort of welcome stuff
markdown("Hey there! Thanks for contributing a PR to a repo! 🎉")


const ensureFileHasNewline = (files) => {
  // Always ensure all files has newlines
  files.forEach(file => {
    danger.git.diffForFile(file).then((el) => {
      if (el.diff.includes('No newline at end of file')) {
        warn(`📂 ***${file}***. ➡️  No newline at end of file.`);
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
const ensureDynamoDBSingleKeyModification = async (files) => {
  // TODO: consider what to do with LSI?
  // TODO: consider multiple use caess e.g. keys removed, added and modified
  files.filter(file => file.includes('dynamodb')).forEach(async file => {
    let multipleGCI = false;
    const diff = await danger.git.diffForFile(file);
    const before = hclToJson(diff.before).dynamodb_table.global_secondary_indexes;
    const after = hclToJson(diff.after).dynamodb_table.global_secondary_indexes;
    const singleGCI = 1;
    if (Math.abs(before.length - after.length) > singleGCI) {
      console.log('length difference');
      multipleGCI = true;
    } else if (getHashDifference(after, before).length > singleGCI) {
      console.log('multiple changes found while comparing "global secondary indexes"');
      multipleGCI = true;
    }
    if (multipleGCI) {
      warn(`📂 ***${file}*** ➡️  (Potential issue) Only one GSI can be modified at a time, otherwise AWS will complain..`);
      return
    }

    const beforeHashKeys = before.reduce((obj, item) => (obj[item.hash_key] = item.non_key_attributes, obj), {});
    // potentially not just `non_key_attributes` cannot be modified.
    after.filter(el => el.hash_key in beforeHashKeys).forEach(el => {
      if (el.non_key_attributes.length !== beforeHashKeys[el.hash_key].length) {
        let msg = [
          `📂 ***${file}*** ➡️  Cannot update GSI's properties other than Provisioned Throughput and Contributor Insights Specification.`,
          "***(Official resolution)*** You can create a new GSI with a different name.",
          `***(non-Official resolution)*** Remove GCI '${el.hash_key}' key in one MR and create a new MR with new|required values.`
        ].join("\n")
        warn(msg);
      }
    })
  }, Error())
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

const ensureRDSCreationValidated = async (files) => {
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
    match(tfvarsCreated, ['**/dev/**'], {}).forEach(async file => {
      const diff = await danger.git.diffForFile(file);
      const data = hclToJson(diff.after);
      let { instance_class, engine, engine_version } = data.rds_config.instance_config
      if (engine === 'postgres' && !match.isMatch(instance_class, rdsRecommendInstanceTypesInDev)) {
        warn(`📂 ${file}. ➡️  (💸 saving) In \`dev\` environment instance class \`${instance_class}\` not recommended. Consider smaller sizes \`${rdsRecommendInstanceTypesInDev}\` ...`);
      }
      if (engine !== 'postgres') {
        console.log(`mr review weith \`${engine}\` is  not yet supported.`)
      }
    }, Error());
  }

  if (tfvars.created) {
    // make sure latest version in use dev|prod
    tfvarsCreated.forEach(async file => {
      const diff = await danger.git.diffForFile(file);
      const data = hclToJson(diff.after);
      let { engine, engine_version, family } = data.rds_config.instance_config
      if (engine === 'postgres' && engine_version !== rdsPostgres.engine_version && family !== rdsPostgres.family ) {
        warn(`📂 ${file}. ✏️  is there is a reason to created outdated rds. **proposed** \`{ family:${rdsPostgres.family}, engine_version:${rdsPostgres.engine_version} }\` **current** \`{ family:${family}, engine_version:${engine_version} }\``)
      }
      if (engine !== 'postgres') {
        console.log(`mr review weith \`${engine}\` is  not yet supported.`)
      }
    }, Error())
  }
}

// changelog
const shouldChangelogBeModified = [
  'platform-as-a-service/k8s-cluster-config'
]
const changelogSync = async () => {
  // TODO: revisit the check for changelog repo not required
  let changedChangelog = danger.git.modified_files.includes('CHANGELOG.md')
  if (!changedChangelog) {
    // TODO: not required when runs on a repo
    shouldChangelogBeModified.forEach(el => {
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
    'created': 'Create DynamoDB Table.md',
    'modified': 'Update DynamoDB Table.md'
  },
  'appconfig': {
    'created': 'Create AppConfig.md',
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
  let tmpCreatedMissing = !contains(danger.gitlab.mr.description.toLowerCase(), ['## checklist', 'created']);
  let tmpModifiedMissing = !contains(danger.gitlab.mr.description.toLowerCase(), ['## checklist', 'update']);
  let tmpDeletedMissing = !contains(danger.gitlab.mr.description.toLowerCase(), ['## checklist', 'remove']);

  // created
  if (tmpCreatedMissing && tfvarsCreated.length > 0) {
    tfvarsCreated.forEach(file => {
      Object.keys(templates).some(el => {
        if (file.includes(el)) {
          template[el] = 'created'
        }
      });
    })
  }
  // updated
  if (tmpModifiedMissing && tfvarsModified.length > 0) {
    tfvarsModified.forEach(file => {
      Object.keys(templates).some(el => {
        if (file.includes(el)) {
          template[el] = 'modified'
        }
      });
    })
  }
  // deleted
  if (tmpDeletedMissing && tfvarsDeleted.length > 0) {
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
    warn("multiple resources 'created|modified|deleted' in a single MR.")
  }
}

const csvEntryAlphabeticOrderAsync = async () => {
  const csv = danger.git.fileMatch("**.csv");
  if (csv.modified) {
    const csvModified = csv.getKeyedPaths().modified;
    csvModified.forEach(async file => {
      const diff = await danger.git.diffForFile(file);
      const before = diff.before.split('\n').slice(1).filter((a) => a);
      const after = diff.after.split('\n').slice(1).filter((a) => a); // filter to remove empty elements
      const added = array.xor(before, after);
      // const header = after.shift();
      let sorted = [...after].sort((a, b) => {
        let first = a.split(',')[0];
        let second = b.split(',')[0];
        if (first < second) {
          return -1;
        }
        if (first > second) {
          return 1;
        }
        return 0;
      });
      // TODO: review whole msk-topics file, as it does have multiple violations

      const result = [];
      let onlyAdded = true;
      let addedAsTxt = added.join(',');
      for (let i = 0; i < after.length; i++) {
        let first = after[i];
        let second = sorted[i];

        if (onlyAdded && addedAsTxt.includes(first)) {
          // first !== second && right after
          if (first !== second) {
            result.push(`+ ${i + 1} ${after[i]}`)
          }
        }
      }
      if (result.length > 0) {
        // console.log(result)
        let msg = [
          "Please, put the topics in alphabetical order.",
          "A hint below\n",
          "```diff",
          ...result,
          "```"
        ].join("\n")
        warn(msg)
      }
    }, Error())
  }
}

// aurora
let auroraProdInstanceClasses = [
  'db.r5.large', 'db.r5.xlarge', 'db.r5.2xlarge', 'db.r5.4xlarge', 'db.r5.8xlarge',
  'db.r5.12xlarge', 'db.r5.16xlarge', 'db.r5.24xlarge', 'db.r6g.large', 'db.r6g.xlarge', 'db.r6g.2xlarge',
  'db.r6g.4xlarge', 'db.r6g.8xlarge', 'db.r6g.12xlarge', 'db.r6g.16xlarge',
  'db.x2g.large', 'db.x2g.xlarge', 'db.x2g.2xlarge', 'db.x2g.4xlarge', 'db.x2g.8xlarge', 'db.x2g.16xlarge'
];
let auroraDevInstanceClasses = ['db.t3.small', 'dt.t3.medium', 'dt.t3.large', 'db.t4g.medium', 'dt.t4g.large'];

// common
const jiraStoryMisisng = () => {
  if (danger.gitlab.mr.state === 'opened') {
    const isJira = (danger.gitlab.mr.title + danger.gitlab.mr.description).includes("hbidigital.atlassian.net/browse")
    if (!isJira) {
      warn('Add a link to the relevant Jira story.')
    } else {
      console.log('link to jira found')
    }
  }
};

const reviewLargePR = () => {
  const bigPRThreshold = 100;
  // console.log(danger.gitlab.mr)
  if (danger.gitlab.mr.changes_count > bigPRThreshold) {
    warn(`:exclamation: Pull Request size seems relatively large. If Pull Request contains multiple changes, split each into separate PR for faster, easier review.`);
  }
}

const addLabels = async (input) => {
  const mrLabels = danger.gitlab.mr.labels
  const changes = [...mrLabels, ...input.filter(el => !mrLabels.includes(el, 0))];
  if (mrLabels.length != changes.length) {
    const mr = await danger.gitlab.api.MergeRequests.edit(repo, prId, { labels: [...mrLabels, ...input] })
    console.log(`updated labels '${changes}' for mr '${prId}'`)
  }
}

const commonChecks = () => {
  reviewLargePR();
  jiraStoryMisisng();
  ensureFileHasNewline(updatedFiles);
}

const infraChecks = async () => {
  adviseManualApplyMessage(commitFiles);
  await ensureDynamoDBSingleKeyModification(updatedFiles);
  await ensureRDSCreationValidated();
  await templateShouldBeEnforced(commitFiles, mrTemplates);
}

const changelogs = async () => {
  await changelogSync()
}

module.exports = {
  commonChecks,
  infraChecks,
  changelogs,
  csvEntryAlphabeticOrderAsync,
  addLabels
};
