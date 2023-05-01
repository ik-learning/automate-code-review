'use strict';

const match = require('micromatch');

const { links, recommendedRDSStorageTypes,
  auroraRdsRecommendInstanceTypesInDev, rdsConfiguration,
  rdsRecommendInstanceTypesInDev, mrTemplates } = require('../constants');

const
  { uniqueArraySize, arrayContainsString, hclToJson,
  contains } = require("../utils");

const { Base } = require('./base');
// TODO
// test
class Infrastructure extends Base {

  validateElasticCacheRDSInstanceClassExist() {
    console.log('in: validateElasticCacheRDSInstanceClassExist');
    const tfvars = this.danger.git.fileMatch("(elasticache|rds)/**/*.tfvars");
    if (tfvars.created || tfvars.edited) {
      const tfvarsCache = this.danger.git.fileMatch("elasticache/**");
      const tfvarsRDS = this.danger.git.fileMatch("rds/**");
      if (tfvarsCache.created || tfvarsCache.modified) {
        const link = links.nodeTypes['cache']
        message(`🔰  When in doubt. Available [cache node types](${link})`)
      } else if (tfvarsRDS.created || tfvarsRDS.modified) {
        const link = links.nodeTypes['rds']
        message(`🔰  When in doubt, you can validate instance class. Available [rds instance classes](${link})`)
      }
    }
  }

  async removeStorageResources() {
    console.log('in: removeStorageResources');
    const tfvars = this.danger.git.fileMatch(
      "dynamodb/**/*.tfvars", "elasticache/**/*.tfvars",
      "rds/**/*.tfvars", "elasticsearch/**/*.tfvars", "rds-aurora/**/*.tfvars"
    );
    const tfvarsDeleted = tfvars.getKeyedPaths().deleted;
    if (tfvars.deleted && tfvarsDeleted.length > 0) {
        message(`🤖 Make sure to add [skip ci] and request from Platform team manual resources removal...`);
        message(`🤖 (Reminder for a Platform team) We should fix failing pipeline! CI probably is Failing as it can't find a related infrastructure folder anymore.`);
    }
  };

  async ensureRdsCreationValidated() {
    console.log('in: ensureRdsCreationValidated');
    const tfvars = this.danger.git.fileMatch("rds/**/*.tfvars");
    const hcl = this.danger.git.fileMatch("rds/**/*.hcl");
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

    if (tfvars.modified || tfvars.created) {
      message('🤖 Make sure to verify the `plan` job in the merge request pipeline and compare "engine_info.valid_upgrade_targets" output attribute with desired engine version .');
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
          const diff = await this.danger.git.diffForFile(file);
          let data = hclToJson(diff.after);
          let { instance_class, engine, engine_version } = data.rds_config.instance_config
          if (engine === 'postgres' && !match.isMatch(instance_class, rdsRecommendInstanceTypesInDev)) {
            warn(`📂 ${file}. ➡️  (💸 saving) In \`dev\` environment instance class \`${instance_class}\` not recommended. Consider different class \`${rdsRecommendInstanceTypesInDev}\` ...`);
          } else if (engine === 'mysql' && !match.isMatch(instance_class, rdsRecommendInstanceTypesInDev)) {
            warn(`📂 ${file}. ➡️  (💸 saving) In \`dev\` environment instance class \`${instance_class}\` not recommended. Consider different types|class \`${rdsRecommendInstanceTypesInDev}\` ...`);
          }
        }, Error());

        tfvarsCreated.forEach(async file => {
          const diff = await this.danger.git.diffForFile(file);
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
            const arr = instance_class.split(".")
            const suggested = `db.t4g.${arr[2]}`;
            if (instance_class.includes('db.t3.')) {
              warn(`📂 ${file}. ➡️ In \`prod\` environment instance class \`${instance_class}\` not recommended. Consider different class \`${suggested}\` ...`);
            }
          }
          // make sure the recommended engine class is used
          // https://github.com/hashicorp/terraform-provider-aws/issues/27702
          // https://github.com/hashicorp/terraform-provider-aws/pull/27670
          if (arrayContainsString(['mysql', 'postgres'], engine) && storage_type in recommendedRDSStorageTypes) {
            const recommended = recommendedRDSStorageTypes[storage_type];
            warn(`📂 ${file}. ✏️ (Optional) Recommended \`storage_type\` is \`${recommended}\` as it provides better performance and cost efficiency as opposite to  \'${storage_type}\'. [Docs and Migration AWS migration Guide](${links.gp2gp3Migration}) and [UserGuide](${links.rdsUserGuide}).`)
          }
          message(`📂 ${file}. ✏️  Make sure to review CI job output attribute "engine_info.valid_upgrade_targets" in order to understand where the up-to-date "engine" version is requested.`);
        }, Error())
      }
      if (tfvars.modified) {
        let infoMessages = new Set();
        await tfvarsModified.forEach(async file => {
          const diff = await this.danger.git.diffForFile(file);
          // instance classes
          // - instance_class = "db.t3.micro"
          // + instance_class = "db.t3.small"
          const beforeRDSConfig = hclToJson(diff.before).rds_config
          const afterRDSConfig = hclToJson(diff.after).rds_config
          if (typeof beforeRDSConfig === 'undefined' || typeof afterRDSConfig === 'undefined') {
            console.log('skip validation as one of the values is "not defined".')
          } else {
            const before = beforeRDSConfig.instance_config.instance_class;
            const after = afterRDSConfig.instance_config.instance_class;
            const data = hclToJson(diff.after);
            let { engine, storage_type } = data.rds_config.instance_config
            if (before !== after && !infoMessages.has('instance_classes') &&
              !(storage_type in recommendedRDSStorageTypes)) {
              infoMessages.add('instance_classes')
              console.log(`before: ${before}, after: ${after}`);
              message(`🤖 (Experimental|Optional) Instance class modified. Worth to provide a link to datadog dashboard, monitor, relevant capacity planning calculations...`);
            }
            // TODO: remove false when GP3 is supported. Would assume only by new RDS types.
            // https://github.com/hashicorp/terraform-provider-aws/issues/27702
            // https://github.com/hashicorp/terraform-provider-aws/pull/27670
            if (arrayContainsString(['mysql', 'postgres'], engine) && storage_type in recommendedRDSStorageTypes) {
              const recommended = recommendedRDSStorageTypes[storage_type];
              message(`📂 ${file}. ✏️ (Optional) Recommended \`storage_type\` is \`${recommended}\` as it provides better performance and cost efficiency as opposite to \'${storage_type}\'. [Docs and Migration AWS migration Guide](${links.gp2gp3Migration}).`)
            }

            message(`📂 ${file}. ✏️  Make sure to review CI job output attribute "engine_info.valid_upgrade_targets" in order to understand where the up-to-date "engine" version is requested.`);
          }
        }, Error())
      }
    }
  }

  async ensureRdsAuroraCreationValidated() {
    console.log('in: ensureAuroraRdsCreationValidated');

    const tfvars = this.danger.git.fileMatch("rds-aurora/**/*.tfvars");
    const hcl = this.danger.git.fileMatch("rds-aurora/**/*.hcl");
    const tfvarsCreated = tfvars.getKeyedPaths().created;
    const tfvarsModified = tfvars.getKeyedPaths().modified;
    const infoMessages = new Set();
    const threshold = 10;

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

      if (tfvars.modified || tfvars.created) {
        message('🤖 Make sure to verify the `plan` job in the merge request pipeline and compare "engine_info.valid_upgrade_targets" output attribute with desired engine version .');
      }

      if (tfvars.created) {
        tfvarsCreated.forEach(async file => {
          const diff = await this.danger.git.diffForFile(file);
          const data = hclToJson(diff.after).cluster_config;
          const instance_type = data.instance_type;

          if (file.includes('environments/sandbox/') || file.includes('environments/dev/')) {
            if (!match.isMatch(instance_type, auroraRdsRecommendInstanceTypesInDev) && !infoMessages.has('instance_type')) {
              warn(`📂 ${file}. ➡️  (💸 saving) In environment "instance_type" \`${instance_type}\` not recommended. Consider different type \`${auroraRdsRecommendInstanceTypesInDev}\` ...`);
              infoMessages.add('instance_type')
            }
          }
        })
      }

      if (tfvars.modified) {
        await tfvarsModified.forEach(async file => {
          const diff = await this.danger.git.diffForFile(file);
          const beforeConfig = hclToJson(diff.before).cluster_config;
          const afterConfig = hclToJson(diff.after).cluster_config;
          if (typeof afterConfig === 'undefined') {
            console.log('skip validation as one of the values is "not defined".')
          } else {
            const after = afterConfig.cluster_config;
            const data = hclToJson(diff.after).cluster_config;
            const instance_type = data.instance_type;
            const { engine_name, engine_sql_version } = data.engine;

            if (file.includes('environments/sandbox/') || file.includes('environments/dev/')) {
              if (!match.isMatch(instance_type, auroraRdsRecommendInstanceTypesInDev) && !infoMessages.has('instance_type')) {
                warn(`📂 ${file}. ➡️  (💸 saving) In NON production environment "instance_type" \`${instance_type}\` not recommended. Consider different type \`${auroraRdsRecommendInstanceTypesInDev}\` ...`);
                // to remove duplicates
                infoMessages.add('instance_type')
              }
            }
          }
        }, Error())
      }
    }
  }

  async templateShouldBeEnforced() {
    console.log('in: templateShouldBeEnforced');
    const tfvars = this.danger.git.fileMatch("**.tfvars");
    const yamlvars = this.danger.git.fileMatch("**.yaml");
    const tfvarsCreated = tfvars.getKeyedPaths().created;
    const tfvarsModified = tfvars.getKeyedPaths().modified;
    const tfvarsDeleted = tfvars.getKeyedPaths().deleted;
    // TODO: s3 bucket modified bucket, created bucket, deleted bucket
    let template = {}
    // TODO: S3 buckets probably slightly differ
    let tmpCreatedMissing = !contains(this.danger.gitlab.mr.description.toLowerCase(), ['## checklist', 'created']);
    let tmpModifiedMissing = !contains(this.danger.gitlab.mr.description.toLowerCase(), ['## checklist', 'update']);
    let tmpDeletedMissing = !contains(this.danger.gitlab.mr.description.toLowerCase(), ['## checklist', 'remove']);
    // created
    if (tmpCreatedMissing && tfvarsCreated.length > 0) {
      // todo: test
      tfvarsCreated.forEach(file => {
        const stack = file.split("/")[0];
        if (stack in templates) {
          template[stack] = 'created'
        }
      })
    }
    // updated
    if (tmpModifiedMissing && tfvarsModified.length > 0) {
      // todo: test
      tfvarsModified.forEach(file => {
        const stack = file.split("/")[0];
        if (stack in templates) {
          template[stack] = 'modified'
        }
      })
    }
    // deleted
    if (tmpDeletedMissing && tfvarsDeleted.length > 0) {
      // todo: test
      tfvarsDeleted.forEach(file => {
        const stack = file.split("/")[0];
        if (stack in templates) {
          template[stack] = 'deleted'
        }
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

  // TODO: mysql5.7 out of life support add warning with toxic

  async run() {
    this.validateElasticCacheRDSInstanceClassExist();
    await this.removeStorageResources();
    await this.ensureRdsCreationValidated();
    await this.ensureRdsAuroraCreationValidated();
    await this.templateShouldBeEnforced();
  }
}

module.exports = {
  Infrastructure,
}
