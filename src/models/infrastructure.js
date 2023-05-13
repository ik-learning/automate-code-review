'use strict';

const match = require('micromatch');

const { links, recommendedRDSStorageTypes,
  auroraRdsRecommendInstanceTypesInDev, rdsConfiguration,
  rdsRecommendInstanceTypesInDev, mrTemplates } = require('../constants');

const
  { uniqueElementsCount, inputInCollection, hclParse,
    sentenceContainsMarkers, isDiff, writeFileSync } = require("../utils");

const { Base } = require('./base');
// TODO
// test
class Infrastructure extends Base {

  /**
   * Validate Instance Class Exists
   */
  validateInstanceClassExist() {
    console.log('in: validateElasticCacheRDSInstanceClassExist');
    const vars = this.danger.git.fileMatch("(elasticache|rds)/**/*.tfvars");
    if (vars.created || vars.modified || vars.edited) {
      const varsCache = this.danger.git.fileMatch("elasticache/**");
      const varsRDS = this.danger.git.fileMatch("rds/**");
      if (varsCache.created || varsCache.modified || varsCache.edited) {
        const link = links.nodeTypes['cache']
        message(`🔰  When in doubt, available [cache node types](${link})`)
      } else if (varsRDS.created || varsRDS.modified || varsRDS.edited) {
        const link = links.nodeTypes['rds']
        message(`🔰  When in doubt, available [rds instance classes](${link})`)
      }
    }
  }

  /**
   * Resource deletion requests
   */
  async removeStorageResources() {
    console.log('in: removeStorageResources');
    const tfvars = this.danger.git.fileMatch(
      "dynamodb/**/*.tfvars", "elasticache/**/*.tfvars",
      "rds/**/*.tfvars", "elasticsearch/**/*.tfvars", "rds-aurora/**/*.tfvars"
    );
    const tfvarsDeleted = tfvars.getKeyedPaths().deleted;
    if (tfvars.deleted && tfvarsDeleted.length > 0) {
      message(`🤖 Make sure to add [skip ci] and request from Platform team manual resources removal...`);
      message(`🤖 (Reminder) CI probably is Failing as it can't find a related infrastructure folder anymore.`);
    }
  };

  /**
   *  Mysql 5 end-of-life
   */
  async rdsMysql5EndOfLifeDate() {
    console.log('in: rdsMysql5EndOfLifeDate');
    const tfvars = this.danger.git.fileMatch("rds/**/*.tfvars");
    if (tfvars.modified || tfvars.created) {
      const tfvarsCreated = tfvars.getKeyedPaths().created;
      const tfvarsModified = tfvars.getKeyedPaths().modified;
      // merge them
      const varsMerged = tfvarsCreated.concat(tfvarsModified);
      varsMerged.forEach(async file => {
        const diff = await this.danger.git.diffForFile(file);
        let { family } = hclParse(diff.after).rds_config?.instance_config
        if (family.includes("mysql5")) {
          const text = [
            `☣️  [MySQL5.7 End of life support is October 2023, when are you planning on upgrading?](${links.mysqlRdsEndOfLife}).`,
            "Can you share a follow-up story if you can't upgrade right now?"
          ].join("\n")
          warn(text);
        }
      }, Error())
    }
  }

  /**
   * .tfvars and .hcl file should be created at the same time
   */
  validateVarsAndHclCreated() {
    console.log('in: validateVarsAndHclCreated');

    const vars = this.danger.git.fileMatch("rds/**/*.tfvars", "rds-aurora/**/*.tfvars");
    const hcl = this.danger.git.fileMatch("rds/**/*.hcl", "rds-aurora/**/*.hcl");

    if (vars.getKeyedPaths().created.length !== hcl.getKeyedPaths().created.length) {
      if (vars.getKeyedPaths().created.length > hcl.getKeyedPaths().created.length) {
        const details = [
          "*No `*.hcl` file detected* for every `*.tfvars`. Create a `terragrunt.hcl` file next to `*.tfvars` with the below **exact** content: <br>",
          "```",
          "include \"common\" {\r",
          " path = find_in_parent_folders(\"common.hcl\")\r",
          "}",
          "```"
        ].join("\n")
        warn(details)
      } else if (vars.getKeyedPaths().created.length < hcl.getKeyedPaths().created.length) {
        warn("*No `*.tfvars` file detected* for every `*.hcl`. Create a `terraform.tfvars` file next to `*.hcl`")
      }
    }
  }

  // RDS
  /**
   * Single stack for environment is updated at once
   */
  validateSingleStackAtOnceCreated() {
    console.log('in: validateSingleStackAtOnceCreated');

    const vars = this.danger.git.fileMatch("rds/**/*.tfvars", "rds-aurora/**/*.tfvars");
    const created = vars.getKeyedPaths().created;
    const envs = new Set()
    created.forEach(el => {
      if (el.includes('/dev/')) {
        envs.add('dev')
      } else if (el.includes('/prod/')) {
        envs.add('prod')
      }
    })
    if (envs.size > 1) {
      message('🤖 Do you need **prod** immediately too, or can it be split out and deployed later (ie. will you be using it today?).');
    }
  }

  /**
   * Validate RDS plan
   */
  validateRdsPlan() {
    console.log('in: validateRdsPlan');
    const vars = this.danger.git.fileMatch("rds/**/*.tfvars", "rds-aurora/**/*.tfvars");

    if (vars.modified || vars.created) {
      message('🤖 Make sure to verify the `plan` job in the merge request pipeline and compare "engine_info.valid_upgrade_targets" output attribute with desired engine version.');
    }
  }

  validateRdsCommons() {
    const tfvars = this.danger.git.fileMatch("rds/**/*.tfvars");
    const tfvarsCreated = tfvars.getKeyedPaths().created;
    const tfvarsModified = tfvars.getKeyedPaths().modified;
    const tfvarsDeleted = tfvars.getKeyedPaths().deleted;

    let threshold = 10;
    let reviewCount = uniqueElementsCount(tfvarsCreated, tfvarsModified, tfvarsDeleted);

    if (reviewCount > threshold) {
      warn(`☣️  Skip review as number of changes hit a threshold. Threshold is set to "${threshold}" to avoid Gitlab API throttling and to simplify code review.`);
    } else if (uniqueElementsCount(tfvars.getKeyedPaths().edited) > 2
      || uniqueElementsCount(tfvars.getKeyedPaths().modified) > 2
      || uniqueElementsCount(tfvars.getKeyedPaths().deleted) > 2) {
      warn(`☣️  Multiple configurations modified in single MR. Is this expected?`);
    }
  }

  /**
   * RDS creation validated
   */
  async validateRdsCreation() {
    console.log('in: validateRdsCreation');
    const tfvars = this.danger.git.fileMatch("rds/**/*.tfvars");
    const tfvarsCreated = tfvars.getKeyedPaths().created;
    let threshold = 2;

    let reviewCount = uniqueElementsCount(tfvars.getKeyedPaths().created);

    if (reviewCount < threshold && tfvars.created) {
      // validate instance class in dev
      match(tfvarsCreated, ['**/dev/**'], {}).forEach(async file => {
        const diff = await this.danger.git.diffForFile(file);
        let data = hclParse(diff.after);
        let { instance_class, engine, engine_version, family } = data.rds_config.instance_config
        if (engine === 'postgres' && instance_class && !match.isMatch(instance_class, rdsRecommendInstanceTypesInDev)) {
          warn(`📂 ${file}. ➡️  (💸 saving) In \`dev\` environment instance class \`${instance_class}\` not recommended. Consider different class \`${rdsRecommendInstanceTypesInDev}\` ...`);
        } else if (engine === 'mysql' && !family.includes('mysql5') && instance_class && !match.isMatch(instance_class, rdsRecommendInstanceTypesInDev)) {
          warn(`📂 ${file}. ➡️  (💸 saving) In \`dev\` environment instance class \`${instance_class}\` not recommended. Consider different types|class \`${rdsRecommendInstanceTypesInDev}\` ...`);
        }
      }, Error());

      tfvarsCreated.forEach(async file => {
        const diff = await this.danger.git.diffForFile(file);
        const data = hclParse(diff.after);
        let { engine, engine_version, family, storage_type, instance_class } = data.rds_config.instance_config
        let rdsFamily = rdsConfiguration[engine].family
        // make sure latest engine version is in use dev|prod
        if (engine === 'postgres' && family !== rdsFamily) {
          warn(`📂 ${file}. ✏️  is there is a reason to create an rds with outdated engine?. **recommended** \`{ family:${rdsFamily} }\` **current** \`{ family:${family}, engine_version:${engine_version} }\``)
        }
        if (engine === 'mysql' && family !== rdsFamily) {
          warn(`📂 ${file}. ✏️  is there is a reason to create an rds with outdated engine? **recommended** \`{ family:${rdsFamily} }\` **current** \`{ family:${family}, engine_version:${engine_version} }\``)
        }
        if (file.includes('/prod/')) {
          const arr = instance_class.split(".")
          const suggested = `db.t4g.${arr[2]}`;
          if (instance_class.includes('db.t3.')) {
            warn(`📂 ${file}. ➡️ In \`prod\` environment instance class \`${instance_class}\` not recommended. Consider different class \`${suggested}\` ...`);
          }
        }
        if (inputInCollection(engine, ['mysql', 'postgres']) && storage_type in recommendedRDSStorageTypes) {
          const recommended = recommendedRDSStorageTypes[storage_type];
          warn(`📂 ${file}. ✏️ (Optional) Recommended \`storage_type\` is \`${recommended}\` as it provides better performance and cost efficiency as opposite to  \'${storage_type}\'. [Docs and Migration AWS migration Guide](${links.gp2gp3Migration}) and [UserGuide](${links.rdsUserGuide}).`)
        }

        message(`📂 ${file}. ✏️  Make sure to review CI job output attribute "engine_info.valid_upgrade_targets" in order to understand where the up-to-date "engine" version is requested.`);
      }, Error())
    }
  }

  // TODO: test
  /**
   * RDS modification validation
   */
  async validateRdsModification() {
    const tfvars = this.danger.git.fileMatch("rds/**/*.tfvars");
    const tfvarsModified = tfvars.getKeyedPaths().modified;
    let threshold = 2;

    let reviewCount = uniqueElementsCount(tfvars.getKeyedPaths().modified);

    if (reviewCount <= threshold && tfvars.modified) {
      let infoMessages = new Set();

      message(`📂 ${file}. ✏️  Make sure to review CI job output attribute "engine_info.valid_upgrade_targets" in order to understand where the up-to-date "engine" version is requested.`);

      await tfvarsModified.forEach(async file => {
        const diff = await this.danger.git.diffForFile(file);
        const beforeRDSConfig = hclParse(diff.before).rds_config
        const afterRDSConfig = hclParse(diff.after).rds_config
        if (typeof beforeRDSConfig === 'undefined' || typeof afterRDSConfig === 'undefined') {
          console.log('skip validation as one of the values is "not defined".')
        } else {
          const before = beforeRDSConfig.instance_config.instance_class;
          const after = afterRDSConfig.instance_config.instance_class;
          const data = hclParse(diff.after);
          let { engine, storage_type } = data.rds_config.instance_config
          if (before !== after && !infoMessages.has('instance_classes') &&
            !(storage_type in recommendedRDSStorageTypes)) {
            infoMessages.add('instance_classes')
            console.log(`before: ${before}, after: ${after}`);
            message(`🤖 Instance class modified. Worth to provide a link to datadog dashboard, monitor, relevant capacity planning calculations...`);
          }
          if (inputInCollection(engine, ['mysql', 'postgres']) && storage_type in recommendedRDSStorageTypes) {
            const recommended = recommendedRDSStorageTypes[storage_type];
            message(`📂 ${file}. ✏️ (Optional) Recommended \`storage_type\` is \`${recommended}\` as it provides better performance and cost efficiency as opposite to \'${storage_type}\'. [Docs and Migration AWS migration Guide](${links.gp2gp3Migration}).`)
          }
        }
      }, Error())
    }
  }

  // TODO: test
  /**
   * RDS-aurora creation validated
   */
  async validateRdsAuroraCreation() {
    console.log('in: validateRdsAuroraCreation');

    const tfvars = this.danger.git.fileMatch("rds-aurora/**/*.tfvars");
    const tfvarsCreated = tfvars.getKeyedPaths().created;
    const tfvarsModified = tfvars.getKeyedPaths().modified;
    const infoMessages = new Set();
    const threshold = 10;

    let reviewCount = uniqueElementsCount(tfvars.getKeyedPaths().modified, tfvars.getKeyedPaths().created);

    if (reviewCount > threshold) {
      warn(`☣️  Skip review as number of changes hit a threshold. Threshold is set to "${threshold}" to avoid Gitlab API throttling and to simplify code review.`);
    } else if (uniqueElementsCount(tfvars.getKeyedPaths().edited) > 2
      || uniqueElementsCount(tfvars.getKeyedPaths().modified) > 2
      || uniqueElementsCount(tfvars.getKeyedPaths().deleted) > 2) {
      warn(`☣️  Multiple configurations modified in single MR. Is this expected?`);
    } else if (reviewCount < threshold) {
      if (tfvars.created) {
        tfvarsCreated.forEach(async file => {
          const diff = await this.danger.git.diffForFile(file);
          const data = hclParse(diff.after).cluster_config;
          const instance_type = data.instance_type;

          if (file.includes('/sandbox/') || file.includes('/dev/')) {
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
          const beforeConfig = hclParse(diff.before).cluster_config;
          const afterConfig = hclParse(diff.after).cluster_config;
          if (typeof afterConfig === 'undefined') {
            console.log('skip validation as one of the values is "not defined".')
          } else {
            const after = afterConfig.cluster_config;
            const data = hclParse(diff.after).cluster_config;
            const instance_type = data.instance_type;
            const { engine_name, engine_sql_version } = data.engine;

            if (file.includes('/sandbox/') || file.includes('/dev/')) {
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

  /**
   * Enforce MR template for a given stack
   */
  async templateShouldBeEnforced() {
    console.log('in: templateShouldBeEnforced');
    const templates = mrTemplates;
    const vars = this.danger.git.fileMatch("**.tfvars", "**.yaml");

    // What
    // 1. From 'rds/environments/dev/eu-west-1/seller-experience-finance/terraform.tfvars' to 'rds'
    // 2. Check whether 'rds' is in supported templates 'mrTemplates'
    const varsCreated = new Set(vars.getKeyedPaths().created.map(a => a.split('/')[0]).filter(stack => stack in mrTemplates));
    const varsModified = new Set(vars.getKeyedPaths().modified.map(a => a.split('/')[0]).filter(stack => stack in mrTemplates));
    const varsDeleted = new Set(vars.getKeyedPaths().deleted.map(a => a.split('/')[0]).filter(stack => stack in mrTemplates));

    let template = new Set()
    // What
    // 1. Description contains markers
    // 2. And at least a single file modified
    let createdMissing = !sentenceContainsMarkers(this.mrDescription, ['## checklist', 'create']);
    let modifiedMissing = !sentenceContainsMarkers(this.mrDescription, ['## checklist', 'update']);
    let deletedMissing = !sentenceContainsMarkers(this.mrDescription, ['## checklist', 'remove']);

    // created
    [...varsCreated].filter(a => createdMissing).forEach(stack => template.add({ stack: stack, action: 'created' }));
    // updated
    [...varsModified].filter(a => modifiedMissing).forEach(stack => template.add({ stack: stack, action: 'modified' }));
    // deleted
    [...varsDeleted].filter(a => deletedMissing).forEach(stack => template.add({ stack: stack, action: 'deleted' }));

    if (template.size === 1) {
      template.forEach((el) => {
        const mrTemplate = mrTemplates[el.stack][el.action];
        const mrTemplateWithoutExt = mrTemplate.split('.')[0];
        const sanitized = mrTemplate.split(" ").join("%20");
        const link = `https://gitlab.com/${this.repo}/-/blob/master/.gitlab/merge_request_templates/${sanitized}`;
        warn(`MR template is missing ***Edit>Description>Choose Template*** [${mrTemplateWithoutExt}](${link}), provide details and a jira ticket...`);
      });
    } else if (template.size > 1) {
      fail(`multiple resources "created|modified|deleted" for stacks in "${Object.keys(template).join('&')}" in a single MR.`)
    }
  }

  // DynamoDB
  /**
   * DynamoDB common checks
   */
  async validateDBCommons() {
    console.log('in: dynamoDBCommonChecks');
    const tfvars = this.danger.git.fileMatch("dynamodb/**/*.tfvars", "**/dynamodb/**/*.tfvars");

    // currently turned off
    if (false && (tfvars.modified || tfvars.edited || tfvars.created)) {
      const commitFiles = new Set([
        ...tfvars.getKeyedPaths().modified,
        ...tfvars.getKeyedPaths().edited,
        ...tfvars.getKeyedPaths().created,
      ]);
      commitFiles.forEach(async file => {
        const diff = await this.danger.git.diffForFile(file);
        const after = hclParse(diff.after).dynamodb_table.global_secondary_indexes;
        // check for billing mode
        const { billing_mode } = hclParse(diff.after).dynamodb_table;

        if (billing_mode === 'PAY_PER_REQUEST') {
          // let msg = `📂 ${ file }. ➡️  (💸 saving) The "billing_mode PAY_PER_REQUEST" is not recommended and in general will cost HBi more then it should.`
          let msg = `📂 ${file}. ➡️ The "billing_mode PAY_PER_REQUEST" is configured. Make sure to share usage pattern e.g. number of requests, item size and other relevant information in MR description.`
          // let msg = `📂 ${ file }. ➡️ The "billing_mode PAY_PER_REQUEST" is configured. The 💸  cost is being dependant on workload, and needs careful consideration.`
          let out = [
            msg + "<br>",
            '- Has provisioned mode been considered?',
            `- You can find [Guidance here](${links.noSqlDraftReq})<br>`,
            `- DynamoDB [item size Calculator](${links.dynamoDbItemSizeCalc})`,
            `- DynamoDB [pricing Calculator](${links.dynamoDbPriceCalc})`,
          ].join("\n")

          message(out);
        }

      })
    }
  }

  /**
   * DynamoDB Single Key modification validation
   * @returns
   */
  async validateDBSingleKeyModification() {
    console.log('in: ensureDynamoDBSingleKeyModification');
    const threshold = 10;
    const maxDiff = 1;
    const files = this.danger.git.fileMatch("dynamodb/**/*.tfvars", "**/dynamodb/**/*.tfvars");
    let reviewCount = uniqueElementsCount(files.getKeyedPaths().modified);

    if (reviewCount > threshold) {
      warn(`☣️  Skip review as number of "DynamoDB" file changed hit a threshold. Threshold is set to "${threshold}" to avoid Gitlab API throttling.`);
    } else if (reviewCount < threshold && reviewCount > 0) {
      new Set(files.getKeyedPaths().modified).forEach(async file => {
        const diff = await this.danger.git.diffForFile(file);
        const before = hclParse(diff.before).dynamodb_table.global_secondary_indexes;
        const after = hclParse(diff.after).dynamodb_table.global_secondary_indexes;
        if (isDiff(before, after, maxDiff)) {
          console.debug('multiple changes found while comparing "global secondary indexes"');
          warn(`📂 ***${file}*** ➡️  (Potential issue) Only one GSI can be modified at a time, otherwise AWS will complain..`);
        } else {
          const beforeHashKeys = before.reduce((obj, item) => (obj[item.name] = item.non_key_attributes, obj), {});
          const beforeRangeKeys = before.reduce((obj, item) => (obj[item.name] = item.range_key, obj), {});
          after.filter(el => el.name in beforeHashKeys || el.name in beforeRangeKeys).forEach(el => {
            let msg = [
              `📂 ***${file}*** ➡️  Cannot update GSI's properties other than ***Provisioned Throughput*** and ***Contributor Insights Specification***.`,
              "***(Official resolution)*** You can create a new GSI with a different name.",
              `***(non-Official resolution)*** Remove GCI '${el.name}' key in one MR and create a new MR with new|required values.`
            ].join("\n")
            if (el.non_key_attributes && el.non_key_attributes.length !== beforeHashKeys[el.name].length) {
              warn(msg);
            } else if (el.range_key && el.range_key != beforeRangeKeys[el.name]) {
              warn(msg);
            }
          })
        }
      }, Error())
    }
  }

  async run() {
    this.validateInstanceClassExist();
    this.validateRdsPlan();
    this.validateRdsCommons();
    this.validateSingleStackAtOnceCreated();
    this.validateVarsAndHclCreated();
    await this.removeStorageResources();
    await this.validateRdsCreation();
    // TODO: test
    await this.validateRdsModification();
    // TODO: test
    await this.validateRdsAuroraCreation();
    await this.templateShouldBeEnforced();
    await this.rdsMysql5EndOfLifeDate();
    await this.validateDBCommons();
    await this.validateDBSingleKeyModification();
  }
}

module.exports = {
  Infrastructure,
}
