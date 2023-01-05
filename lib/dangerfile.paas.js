'use strict';

// Danger is accessible globally
const match = require('micromatch');
const array = require('lodash/array');

// helpers & utils
const
  { contains, hclToJson, getHashDifference, uniqueArraySize, arrayContainsString } = require("./utils");
const {
  repo, prId, links,
  mrTemplates, mrTemplatesMsk, recommendedRDSStorageTypes,
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

// DYNAMODB
const ensureDynamoDBSingleKeyModification = async () => {
  console.log('in: ensureDynamoDBSingleKeyModification');
  // TODO: consider what to do with LSI?
  let threshold = 10;
  const tfvars = danger.git.fileMatch("dynamodb/**/*.tfvars", "**/dynamodb/**/*.tfvars");
  if (uniqueArraySize(tfvars.getKeyedPaths().modified, tfvars.getKeyedPaths().deleted, tfvars.getKeyedPaths().created) > threshold) {
    warn(`☣️  Skip review as number of "DynamoDB" file changed hit a threshold. Threshold is set to "${threshold}" to avoid Gitlab API throttling.`);
  } else if (tfvars.modified || tfvars.created || tfvars.deleted) {
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
        const beforeHashKeys = before.reduce((obj, item) => (obj[item.name] = item.non_key_attributes, obj), {});
        // potentially not just `non_key_attributes` cannot be modified.
        after.filter(el => el.name in beforeHashKeys).forEach(el => {
          if (el.non_key_attributes !== null && beforeHashKeys[el.name] !== null) {
            if (el.non_key_attributes.length === 0 && beforeHashKeys[el.name].length === 0) {
              // skip as length is zero in both cases
            }
            else if (el.non_key_attributes !== null && beforeHashKeys[el.name] !== null) {
              if (el.non_key_attributes.length !== beforeHashKeys[el.name].length) {
                let msg = [
                  `📂 ***${file}*** ➡️  Cannot update GSI's properties other than Provisioned Throughput and Contributor Insights Specification.`,
                  "***(Official resolution)*** You can create a new GSI with a different name.",
                  `***(non-Official resolution)*** Remove GCI '${el.name}' key in one MR and create a new MR with new|required values.`
                ].join("\n")
                warn(msg);
              }
            }
          } else if (el.non_key_attributes === null && beforeHashKeys[el.name] !== null && beforeHashKeys[el.name].length > 1) {
            let msg = [
              `📂 ***${file}*** ➡️  Cannot update GSI's properties other than Provisioned Throughput and Contributor Insights Specification.`,
              "***(Official resolution)*** You can create a new GSI with a different name.",
              `***(non-Official resolution)*** Remove GCI '${el.name}' key in one MR and create a new MR with new|required values.`
            ].join("\n")
            warn(msg);
          } else if (el.non_key_attributes !== null && beforeHashKeys[el.name] === null && el.non_key_attributes.length > 1) {
            let msg = [
              `📂 ***${file}*** ➡️  Cannot update GSI's properties other than Provisioned Throughput and Contributor Insights Specification.`,
              "***(Official resolution)*** You can create a new GSI with a different name.",
              `***(non-Official resolution)*** Remove GCI '${el.name}' key in one MR and create a new MR with new|required values.`
            ].join("\n")
            warn(msg);
          }
        })
      }, Error())
    }
  }
}

// RDS
const ensureRDSCreationValidated = async (files) => {
  console.log('in: ensureRDSCreationValidated');
  // TODO: support aurora
  const tfvars = danger.git.fileMatch("rds/**/*.tfvars");
  const hcl = danger.git.fileMatch("rds/**/*.hcl");
  const tfvarsCreated = tfvars.getKeyedPaths().created;
  const tfvarsModified = tfvars.getKeyedPaths().modified;
  let threshold = 10;
  // should not even do stuff if no RDS
  if (tfvarsCreated.length !== hcl.getKeyedPaths().created.length) {
    const details = [
      "*No `*.hcl` file detected*. Create a `terragrunt.hcl` file next to `*.tfvars` with the below **exact** content: <br>",
      "```",
      "include \"common\" {\r",
      " path = find_in_parent_folders(\"common.hcl\")\r",
      "}",
      "```"
    ].join("\n")
    warn(details)
  }
  if (tfvarsCreated.length > 1) {
    message('🤖 Do you need **prod** immediately too, or can it be split out and deployed later (ie. will you be using it today?).');
  }

  if (tfvars.modified || tfvars.created || tfvars.deleted) {
    if (uniqueArraySize(tfvars.getKeyedPaths().modified, tfvars.getKeyedPaths().deleted, tfvars.getKeyedPaths().created) > threshold) {
      warn(`☣️  Skip review as number of "RDS" file changed hit a threshold. Threshold is set to "${threshold}" to avoid Gitlab API throttling.`);
    }
    if (uniqueArraySize(tfvars.getKeyedPaths().edited) > 1
      || uniqueArraySize(tfvars.getKeyedPaths().modified) > 1
      || uniqueArraySize(tfvars.getKeyedPaths().deleted) > 1) {
      warn(`☣️  Multiple RDS configurations modified in single MR. Is this expected?`);
    }
    if (tfvars.created) {
      // validate instance class in dev
      match(tfvarsCreated, ['**/dev/**'], {}).forEach(async file => {
        const diff = await danger.git.diffForFile(file);
        let data = hclToJson(diff.after);
        let { instance_class, engine, engine_version } = data.rds_config.instance_config
        if (engine === 'postgres' && !match.isMatch(instance_class, rdsRecommendInstanceTypesInDev)) {
          warn(`📂 ${file}. ➡️  (💸 saving) In \`dev\` environment instance class \`${instance_class}\` not recommended. Consider different class \`${rdsRecommendInstanceTypesInDev}\` ...`);
        } else if (engine === 'mysql' && !match.isMatch(instance_class, rdsRecommendInstanceTypesInDev)) {
          warn(`📂 ${file}. ➡️  (💸 saving) In \`dev\` environment instance class \`${instance_class}\` not recommended. Consider different types|class \`${rdsRecommendInstanceTypesInDev}\` ...`);
        }
      }, Error());

      tfvarsCreated.forEach(async file => {
        const diff = await danger.git.diffForFile(file);
        const data = hclToJson(diff.after);
        let { engine, engine_version, family, storage_type, instance_class } = data.rds_config.instance_config
        let rdsEngineVersion = rdsConfiguration[engine].engine_version
        let rdsFamily = rdsConfiguration[engine].family
        // make sure latest engine version is in use dev|prod
        if (engine === 'postgres' && engine_version !== rdsEngineVersion && family !== rdsFamily) {
          warn(`📂 ${file}. ✏️  is there is a reason to create an rds with outdated engine?. **recommended** \`{ family:${rdsFamily}, engine_version:${rdsEngineVersion} }\` **current** \`{ family:${family}, engine_version:${engine_version} }\``)
        }
        if (engine === 'mysql' && engine_version !== rdsEngineVersion && family !== rdsFamily) {
          warn(`📂 ${file}. ✏️  is there is a reason to create an rds with outdated engine? **recommended** \`{ family:${rdsFamily}, engine_version:${rdsEngineVersion} }\` **current** \`{ family:${family}, engine_version:${engine_version} }\``)
        }
        // instance class validation in prod
        if (file.includes('/prod/')) {
          if (engine === 'postgres' && !match.isMatch(instance_class, rdsRecommendInstanceTypesInDev)) {
            warn(`📂 ${file}. ➡️  (💸 saving) In \`prod\` environment instance class \`${instance_class}\` not recommended. Consider different class \`${rdsRecommendInstanceTypesInDev}\` ...`);
          }
          if (engine === 'mysql' && !match.isMatch(instance_class, rdsRecommendInstanceTypesInDev)) {
            warn(`📂 ${file}. ➡️  (💸 saving) In \`prod\` environment instance class \`${instance_class}\` not recommended. Consider different sizes \`${rdsRecommendInstanceTypesInDev}\` ...`);
          }
        }
        // make sure the recommended engine class is used
        // https://github.com/hashicorp/terraform-provider-aws/issues/27702
        // https://github.com/hashicorp/terraform-provider-aws/pull/27670
        if (false) {
          if (arrayContainsString(['mysql', 'postgres'], engine) && storage_type in recommendedRDSStorageTypes) {
            const recommended = recommendedRDSStorageTypes[storage_type];
            warn(`📂 ${file}. ✏️ (Optional) Recommended \`storage_type\` is \`${recommended}\` as it provides better performance and cost efficiency as opposite to  \'${storage_type}\'. [Docs and Migration AWS migration Guide](${links.gp2gp3Migration}) and [UserGuide](${links.rdsUserGuide}).`)
          }
        }
      }, Error())
    }
    if (tfvars.modified) {
      // TODO: test this functionality
      let infoMessages = new Set();
      await tfvarsModified.forEach(async file => {
        const diff = await danger.git.diffForFile(file);
        // instance classes
        // - instance_class = "db.t3.micro"
        // + instance_class = "db.t3.small"
        const before = hclToJson(diff.before).rds_config.instance_config.instance_class;
        const after = hclToJson(diff.after).rds_config.instance_config.instance_class;
        const data = hclToJson(diff.after);
        let { engine, storage_type } = data.rds_config.instance_config
        if (before !== after && !infoMessages.has('instance_classes') &&
          !(storage_type in recommendedRDSStorageTypes)) {
          infoMessages.add('instance_classes')
          console.log(`before: ${before}, after: ${after}`);
          message(`🤖 (Experimental|Optional) Instance class modified. Worth to provide a link to datadog dashboard, monitor, relevant capacity planning calculations...`);
        }
        if (false) {
          // TODO: remove false when supported
          // https://github.com/hashicorp/terraform-provider-aws/issues/27702
          // https://github.com/hashicorp/terraform-provider-aws/pull/27670
          if (arrayContainsString(['mysql', 'postgres'], engine) && storage_type in recommendedRDSStorageTypes) {
            const recommended = recommendedRDSStorageTypes[storage_type];
            message(`📂 ${file}. ✏️ (Optional) Recommended \`storage_type\` is \`${recommended}\` as it provides better performance and cost efficiency as opposite to \'${storage_type}\'. [Docs and Migration AWS migration Guide](${links.gp2gp3Migration}).`)
          }
        }
      }, Error())
    }
  }
}

// Elastic Cache
const validateInstanceClassExist = () => {
  console.log('in: validateInstanceClassExist');
  const tfvars = danger.git.fileMatch("elasticache/**/*.tfvars");
  // TODO: for edited files do more specific check
  if (tfvars.created || tfvars.edited) {
    message("🔰  Make sure to validate instance class. Can be done [here](https://instances.vantage.sh/)")
  }
}

// Remove
const removeStorageResources = async () => {
  console.log('in: removeStorageResources');
  // TODO: test me
  const tfvars = danger.git.fileMatch(
    "dynamodb/**/*.tfvars", "elasticache/**/*.tfvars",
    "rds/**/*.tfvars", "elasticsearch/**/*.tfvars", "rds-aurora/**/*.tfvars"
  );
  const tfvarsDeleted = tfvars.getKeyedPaths().deleted;
  if (tfvars.deleted) {
    if (tfvarsDeleted.length > 0) {
      message(`🤖 We should fix failing pipeline!!! Failing as it can't find the instance folder anymore. We can add [skip ci] and remove resources resources...`);
    }
  }
};

// MSK
const templateShouldBeEnforcedMsk = async () => {
  console.log('in: templateShouldBeEnforcedMsk');
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
  message(`❗ For consistency, the team should decide which convention you want to go with e.g. \`-\` or \`_\`.`)
}

const templateShouldBeEnforced = async (templates) => {
  console.log('in: templateShouldBeEnforced');
  const tfvars = danger.git.fileMatch("**.tfvars");
  const tfvarsCreated = tfvars.getKeyedPaths().created;
  const tfvarsModified = tfvars.getKeyedPaths().modified;
  const tfvarsDeleted = tfvars.getKeyedPaths().deleted;

  let template = {}
  // TODO: S3 buckets probably slighly differ
  let tmpCreatedMissing = !contains(danger.gitlab.mr.description.toLowerCase(), ['## checklist', 'created']);
  let tmpModifiedMissing = !contains(danger.gitlab.mr.description.toLowerCase(), ['## checklist', 'update']);
  let tmpDeletedMissing = !contains(danger.gitlab.mr.description.toLowerCase(), ['## checklist', 'remove']);
  // created
  if (tmpCreatedMissing && tfvarsCreated.length > 0) {
    // todo: simplify
    tfvarsCreated.forEach(file => {
      Object.keys(templates).some(el => {
        if (!(el in template) && file.startsWith(el)) {
          template[el] = 'created'
        }
      });
    })
  }
  // updated
  if (tmpModifiedMissing && tfvarsModified.length > 0) {
    tfvarsModified.forEach(file => {
      Object.keys(templates).some(el => {
        if (!(el in template) && file.startsWith(el)) {
          template[el] = 'modified'
        }
      });
    })
  }
  // deleted
  if (tmpDeletedMissing && tfvarsDeleted.length > 0) {
    tfvarsDeleted.forEach(file => {
      Object.keys(templates).some(el => {
        if (!(el in template) && file.startsWith(el)) {
          template[el] = 'deleted'
        }
      });
    })
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
    fail(`multiple resources "created|modified|deleted" for stacks in "${Object.keys(template).join('&')}" in a single MR.`)
  }
}

const csvEntryAlphabeticOrder = async () => {
  console.log('in: csvEntryAlphabeticOrder');
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

const k8sDeploy = () => {
  console.log('in: k8sDeploy');
  message("🤖 Well done!!! Ensure there is an explanation how the change was tested (demo app|screenshots|other)...");
  // , '.gitlab-ci.(yml|yaml)' should be mofified
  const tests = danger.git.fileMatch(
    "k8s/sandbox/**/*.(yml|yaml)"
  );
  const testsCreated = tests;
  if (testsCreated.getKeyedPaths().created.length == 0) {
    warn('🤖 Is there is a relevant test in ***k8s/sandbox/<feature>/*** folder?')
  }
};

// common
const jiraStoryMissing = () => {
  console.log('in: jiraStoryMissing');
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
  console.log('in: reviewLargePR');
  const filesThreshold = 10;
  if (danger.gitlab.mr.changes_count > filesThreshold) {
    warn(`:exclamation: Pull Request size seems relatively large. If Pull Request contains multiple changes, split each into separate PR for faster, and simplified review. Gitlab API rate limiting throttle 'review-bot' on large MRs.`);
  }
}

const addLabels = async (input) => {
  console.log('in: addLabels');
  const mrLabels = danger.gitlab.mr.labels
  const changes = [...mrLabels, ...input.filter(el => !mrLabels.includes(el, 0))];
  if (mrLabels.length < changes.length) {
    const mr = await danger.gitlab.api.MergeRequests.edit(repo, prId, { labels: [...mrLabels, ...input] })
    console.log(`updated labels '${changes}' for mr '${prId}'`)
  }
}

const addManualApplyMessage = () => {
  console.log('in: addManualApplyMessage');
  // manual apply advice should be added to an MR
  const result = commitFiles.filter((val) => {
    return [
      'terraform', '.gitlab-ci.yml', 'ci.yml', 'environments'
    ].some(el => val.includes(el))
  });
  if (result.length > 0) {
    message("🔰  You'll need to run the manual apply job when changes merged...")
  }
}

const welcomeMsg = input => {
  console.log('in: welcomeMsg');
  let msg = "👋 Hey there! Thank you for contributing an MR to a repo! 🎉. I'm an experimental MR review 🤖 bot."
  if (input && typeof input.url !== 'undefined') {
    let out = [
      msg + "<br>",
      `- you can find me [here](${input.url})<br>`,
      `- [suggest new MR check, share feedback and etc](${links.newIssue})`,
    ].join("\n")
    markdown(out)
  } else {
    markdown(msg)
  }
}

const ensureFileHasNewline = (files) => {
  console.log('in: ensureHasNewLine');
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
const changelogPresent = async () => {
  console.log('in: changelogPresent');
  const chg = danger.git.fileMatch("CHANGELOG.md");

  if (!chg.modified && commitFiles > 1) {
    // TODO: can be set for specific repositories
    warn('This PR modifies multiple files while CHANGELOG not updated.');
  } else if (!chg.modified && commitFiles == 1) {
    message('This PR modifies single file. Is this changes worthly of the CHANGELOG update?');
  }
}

const changelogUnreleased = async () => {
  console.log('in: changelogUnreleased');
  const chg = danger.git.fileMatch("CHANGELOG.md");
  const isForReview = danger.git.modified_files.length > 1;
  if (chg.modified && isForReview) {
    const chgModified = chg.getKeyedPaths().modified;
    const diff = await danger.git.diffForFile(chgModified[0]);
    let changes = diff.diff.split('\n').filter(a => a.replaceAll(/\s/g, '') !== '');
    console.log("changelog: ", changes);
    // example
    // [
    //   ' ## [Unreleased]',
    //   '+### Added',
    //   '+- Simplify command. Added `k8s-deploy` alongside `/usr/local/bin/docker-entrypoint.sh`',
    //   ' ---'
    // ]
    // Unreleased > Added|Changed|Fixed|Removed >
    let firstEl = changes[0];
    let secondEl = changes[1];
    let chagnelogActions = ["Added", "Changed", "Fixed", "Removed"];
    if (changes.length > 1 && firstEl.includes('[Unreleased]') && ["Added", "Changed", "Fixed", "Removed"].some(el => secondEl.includes(el))) {
      message('🤖 Well done!!! Found modified CHANGELOG 🎖🎖🎖.')
    } else if (chagnelogActions.some(el => diff.diff.includes(el))) {
      if (chagnelogActions.some(el => firstEl.includes(el) || secondEl.includes(el))) {
        // console.log('changelog seems legit');
      } else {
        warn('🌶  There should be no version until it is released, that is what the `[Unreleased]` section is for.');
      }
    } else {
      warn('➕  Could you add an entry to the "Unreleased" section of the changelog. Valid entries are `Added|Changed|Fixed|Removed`.');
    }
  }
}

const chartYamlVersionReleased = async () => {
  message('🤖 On release, make sure chart `version` is updated in `Chart.yaml` file.');
}

// skip logic
const skipReview = () => {
  console.log('in: skipReview');
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
  validateInstanceClassExist();
  await removeStorageResources();
  await ensureDynamoDBSingleKeyModification();
  await ensureRDSCreationValidated();
  await templateShouldBeEnforced(mrTemplates);
}

const changelogs = async () => {
  await changelogPresent();
  await changelogUnreleased();
  await chartYamlVersionReleased();
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
  skipReview,
  k8sDeploy,
};
