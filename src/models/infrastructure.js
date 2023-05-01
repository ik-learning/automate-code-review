'use strict';

const { links } = require('../constants');
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

  async run() {
    this.validateElasticCacheRDSInstanceClassExist();
    await this.removeStorageResources();
  }
}

module.exports = {
  Infrastructure,
}
