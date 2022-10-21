'use strict';

// Danger is accessible globally
const match = require('micromatch');
const array = require('lodash/array');

// helpers & utils
const
  { contains, hclToJson, getHashDifference } = require("./utils");
const {
  repo, prId, links,
  mrTemplates, mrTemplatesMsk,
  rdsConfiguration, rdsRecommendInstanceTypesInDev } = require('./constants');

const commitFiles = [
  ...danger.git.created_files,
  ...danger.git.deleted_files,
  ...danger.git.modified_files,
];
const updatedFiles = [
  ...danger.git.created_files,
  ...danger.git.modified_files,
];

// dynamodb
const ensureDynamoDBSingleKeyModification = async () => {
  // TODO: consider what to do with LSI?
  const tfvars = danger.git.fileMatch("dynamodb/**/*.tfvars", "**/dynamodb/**/*.tfvars");
  if (tfvars.modified || tfvars.created || tfvars.deleted) {
    if (tfvars.modified) {
      tfvars.getKeyedPaths().modified.forEach(async file => {
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
  }
}

const ensureRDSCreationValidated = async (files) => {
  // TODO: support aurora
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
      if (engine === 'mysql' && !match.isMatch(instance_class, rdsRecommendInstanceTypesInDev)) {
        warn(`📂 ${file}. ➡️  (💸 saving) In \`dev\` environment instance class \`${instance_class}\` not recommended. Consider smaller sizes \`${rdsRecommendInstanceTypesInDev}\` ...`);
      }
    }, Error());
  }

  if (tfvars.created) {
    // make sure latest engine version is in use dev|prod
    tfvarsCreated.forEach(async file => {
      const diff = await danger.git.diffForFile(file);
      const data = hclToJson(diff.after);
      let { engine, engine_version, family } = data.rds_config.instance_config
      let rdsEngineVersion = rdsConfiguration[engine].engine_version
      let rdsFamily = rdsConfiguration[engine].family
      if (engine === 'postgres' && engine_version !== rdsEngineVersion && family !== rdsFamily) {
        warn(`📂 ${file}. ✏️  is there is a reason to create an rds with outdated engine?. **recommended** \`{ family:${rdsFamily}, engine_version:${rdsEngineVersion} }\` **current** \`{ family:${family}, engine_version:${engine_version} }\``)
      }
      if (engine === 'mysql' && engine_version !== rdsEngineVersion && family !== rdsFamily) {
        warn(`📂 ${file}. ✏️  is there is a reason to create an rds with outdated engine? **recommended** \`{ family:${rdsFamily}, engine_version:${rdsEngineVersion} }\` **current** \`{ family:${family}, engine_version:${engine_version} }\``)
      }
    }, Error())
  }
}

const templateShouldBeEnforcedMsk = async () => {
  // file size increased > created
  // file size decreased > deleted
  // file size remain same > modified
  const csv = danger.git.fileMatch("topics.csv");
  if (csv.modified) {
    const csvModified = csv.getKeyedPaths().modified;
    csvModified.forEach(async file => {
      const diff = await danger.git.diffForFile(file);
      const before = diff.before.split('\n').slice(1).filter((a) => a).length;
      const after = diff.after.split('\n').slice(1).filter((a) => a).length;
      let action = null;
      if (before > after && !contains(danger.gitlab.mr.description.toLowerCase(), ['## checklist', 'remove'])) {
        action = 'remove'
      } else if (before < after && !contains(danger.gitlab.mr.description.toLowerCase(), ['## checklist', 'added'])) {
        action = 'add'
      } else if (before == after && !contains(danger.gitlab.mr.description.toLowerCase(), ['## checklist', 'update'])) {
        action = 'update'
      }
      if (action) {
        const template = mrTemplatesMsk[action];
        const templateWithoutExt = template.split('.')[0];
        const sanitized = template.split(" ").join("%20");
        const link = `https://gitlab.com/${repo}/-/blob/master/.gitlab/merge_request_templates/${sanitized}`;
        warn(`MR template is missing ***Edit>Description>Choose Template*** [${templateWithoutExt}](${link}), provide details and a jira ticket...`);
      }
    });
  }
  message(`🛠️  For consistency, the recommended topic name pattern is \`(<vertical>-<team>|<team>)-<project|product>-<name>\` [which vertical the team is](${links.orgStructure})...`)
}

const templateShouldBeEnforced = async (files, templates) => {
  const tfvars = danger.git.fileMatch("**.tfvars");
  const tfvarsCreated = tfvars.getKeyedPaths().created;
  const tfvarsModified = tfvars.getKeyedPaths().modified;
  const tfvarsDeleted = tfvars.getKeyedPaths().deleted;

  let template = {}
  // TODO: support Updated and Deleted
  // TODO: S3 buckets probably slighly differ
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
      const link = `https://gitlab.com/${repo}/-/blob/master/.gitlab/merge_request_templates/${sanitized}`;
      warn(`MR template is missing ***Edit>Description>Choose Template*** [${mrTemplateWithoutExt}](${link}), provide details and a jira ticket...`);
    });
  } else if (Object.keys(template).length > 1) {
    fail("multiple resources 'created|modified|deleted' in a single MR.")
  }
}

const csvEntryAlphabeticOrder= async () => {
  const csv = danger.git.fileMatch("**.csv");
  if (csv.modified) {
    const csvModified = csv.getKeyedPaths().modified;
    csvModified.forEach(async file => {
      const diff = await danger.git.diffForFile(file);
      const before = diff.before.split('\n').slice(1).filter((a) => a);
      const after = diff.after.split('\n').slice(1).filter((a) => a); // filter to remove empty elements
      const added = array.xor(before, after);
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
          if (first !== second) {
            result.push(`+ ${i + 1} ${after[i]}`)
          }
        }
      }
      if (result.length > 0) {
        // console.log(result)
        let msg = [
          "We expect topics to be in alphabetical order.",
          "Topics below not following this order",
          "```diff",
          ...result,
          "```"
        ].join("\n")
        warn(msg)
      }
    }, Error())
  }
}

// common
const jiraStoryMissing = () => {
  if (danger.gitlab.mr.state === 'opened') {
    const isJira = (danger.gitlab.mr.title + danger.gitlab.mr.description).includes("hbidigital.atlassian.net/browse")
    if (!isJira) {
      warn('Make sure there is a link to the relevant Jira story.')
    } else {
      console.log('link to jira found')
    }
  }
};

const reviewLargePR = () => {
  const filesThreshold = 10;
  if (danger.gitlab.mr.changes_count > filesThreshold) {
    warn(`:exclamation: Pull Request size seems relatively large. If Pull Request contains multiple changes, split each into separate PR for faster, easier review.`);
  }
}

const addLabels = async (input) => {
  const mrLabels = danger.gitlab.mr.labels
  const changes = [...mrLabels, ...input.filter(el => !mrLabels.includes(el, 0))];
  if (mrLabels.length !== changes.length) {
    const mr = await danger.gitlab.api.MergeRequests.edit(repo, prId, { labels: [...mrLabels, ...input] })
    console.log(`updated labels '${changes}' for mr '${prId}'`)
  }
}

const conditionsToTriggerApply = [
  'terraform', '.gitlab-ci.yml', 'ci.yml', 'environments'
]

const addManualApplyMessage = () => {
  // manual apply advice should be added to an MR
  const result = commitFiles.filter((val) => {
    return conditionsToTriggerApply.some(el => val.includes(el))
  });
  if (result.length > 0) {
    message("🔰  You'll need to run the manual apply job when changes merged...")
  }
}

const welcomeMsg = input => {
  let msg = "👋 Hey there! Thanks for contributing a PR to a repo! 🎉. I'm an experimental MR review 🤖 bot."
  if (input && typeof input.url !== 'undefined') {
    markdown(`${msg} [review url](${input.url})`)
  } else {
    markdown(`${msg}`)
  }
}

const ensureFileHasNewline = (files) => {
  // ensure all files have newlines
  files.forEach(file => {
    danger.git.diffForFile(file).then((el) => {
      if (el.diff.includes('No newline at end of file')) {
        warn(`📂 ***${file}***. ➡️  No newline at end of file.`);
      }
    })
  });
}

// changelog
const shouldChangelogBeModified = [
  'platform-as-a-service/k8s-cluster-config'
]
const changelogSync = async () => {
  let changedChangelog = danger.git.modified_files.includes('CHANGELOG.md')
  if (!changedChangelog) {
    // TODO: can be set for specific repositories
    shouldChangelogBeModified.forEach(el => {
      if (danger.gitlab.metadata.repoSlug.includes(el)) {
        warn('This PR modified important files but does not have `Added|Changed` entry in the CHANGELOG.');
      }
    });
  }
}

// skip logic
const skipReview = () => {
  let result = false;
  let reviewOnce = false
  if (!danger.gitlab.mr.state.includes('opened')) {
    console.log(`skip MR review as "state" is "${danger.gitlab.mr.state}"`);
    return true;
  }
  if (danger.gitlab.approvals.approved === true) {
    console.log(`skip "approved" MR"`);
    return true;
  }
  if (danger.gitlab.mr.title.toLowerCase().includes("[skip ci]")) {
    console.log('skip MR review as title contains [skip ci]');
    return true;
  }
  if (!result) {
    danger.gitlab.mr.labels.forEach(label => {
      // || label === 'review-bot'
      if (label === 'renovate-bot') {
        console.log(`skip MR review as label 'renovate-bot' found.`);
        result = true;
      }
      if (label === 'review-bot') {
        reviewOnce = true;
      }
    });
  }
  // skip if more then 10 minutes from last commit
  if (!result && danger.gitlab.commits.length > 0) {
    let diff = Math.abs(new Date() - new Date(danger.gitlab.commits[0].created_at));
    let minutes = Math.floor((diff / 1000) / 60);
    const thresholdInMinutes = 5;
    if (minutes > thresholdInMinutes && reviewOnce) {
      console.log(`skip MR review as last commit is older then '${thresholdInMinutes}' minutes.`);
      result = true
    }
  }
  if (!result) {
    danger.git.commits.forEach(commit => {
      if (commit.message.includes("[skip ci]")) {
        console.log(`skip MR review as commit message contains [skip ci]`);
        result = true;
      }
    });
  }
  return result;
}

const commonChecks = () => {
  reviewLargePR();
  jiraStoryMissing();
  ensureFileHasNewline(updatedFiles);
}

const infraChecks = async () => {
  addManualApplyMessage();
  await ensureDynamoDBSingleKeyModification();
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
  addLabels,
  welcomeMsg,
  csvEntryAlphabeticOrder,
  templateShouldBeEnforcedMsk,
  addManualApplyMessage,
  skipReview
};
