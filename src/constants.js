'use strict';

// TODO:
// Move to Base Class danger.
// Test
const mrTemplatesMsk = {
  add: 'Create Topic.md',
  update: 'Update Topic.md',
  remove: 'Delete Topic.md',
}

const links = {
  orgStructure: "https://hbidigital.atlassian.net/wiki/spaces/PPO/pages/5557846070/Tech+and+Product+Org+Structure",
  newIssue: "https://gitlab.com/HnBI/platform-as-a-service/test-projects/automate-code-review/-/issues",
  gp2gp3Migration: "https://aws.amazon.com/blogs/storage/migrate-your-amazon-ebs-volumes-from-gp2-to-gp3-and-save-up-to-20-on-costs/",
  rdsUserGuide: "https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html",
  noSqlDraftReq: "https://hbidigital.atlassian.net/wiki/spaces/PAAS/pages/861470767/NoSQL+Databases+Guidance#Drafting-some-requirements",
  dynamoDbPriceCalc: "https://dynobase.dev/dynamodb-pricing-calculator/",
  dynamoDbItemSizeCalc: "https://dynobase.dev/dynamodb-capacity-and-item-size-calculator/",
  backOfTheEnvelopeCalc: "http://highscalability.com/blog/2011/1/26/google-pro-tip-use-back-of-the-envelope-calculations-to-choo.html",
  nodeTypes: {
    cache: "https://instances.vantage.sh/cache/",
    rds: "https://instances.vantage.sh/rds/",
    ec2: "https://instances.vantage.sh"
  }
}

const mrTemplates = {
  'api-gateway': {
    'created': 'Default.md',
    'modified': 'Default.md',
    'deleted': 'Default.md',
  },
  'appconfig': {
    'created': 'Create AppConfig.md',
    'modified': 'Default.md',
    'deleted': 'Delete AppConfig.md',
  },
  'dynamodb': {
    'created': 'Create DynamoDB Table.md',
    'modified': 'Update DynamoDB Table.md',
    'deleted': 'Default.md'
  },
  'kms': {
    'created': 'Create KMS Key.md',
    'modified': 'Update KMS Key.md',
    'deleted': 'Delete KMS Key.md'
  },
  'rds': {
    'created': 'Create RDS instance.md',
    'modified': 'Update RDS instance.md',
    'deleted': 'Default.md'
  },
  'rds-aurora': {
    'created': 'Create RDS Aurora cluster.md',
    'modified': 'Update RDS Aurora cluster.md',
    'deleted': 'Default.md'
  },
  's3': {
    'created': 'Create S3 Bucket.md',
    'modified': 'Update S3 Bucket.md',
    'deleted': 'Delete S3 Bucket.md'
  },
  'sso': {
    'created': 'Update SSO access.md',
    'modified': 'Update SSO access.md',
    'deleted': 'Update SSO access.md'
  },
  'sns': {
    'created': 'Create SNS.md',
    'modified': 'Create SNS.md',
    'deleted': 'Create SNS.md'
  },
  'sqs': {
    'created': 'Create SQS.md',
    'modified': 'Create SQS.md',
    'deleted': 'Create SQS.md'
  },
  'vault': {
    'created': 'Default.md',
    'modified': 'Update Vault Configuration.md',
    'deleted': 'Delete Vault Configuration.md'
  },
};

const rdsConfiguration = {
  postgres: {
    'engine': 'postgres',
    'engine_version': '15.2',
    'family': 'postgres15'
  },
  mysql: {
    'engine': 'mysql',
    'engine_version': '8.0.32',
    'family': 'mysql8.0'
  }
}

const recommendedRDSStorageTypes = {
  'gp2': 'gp3'
}

const rdsRecommendInstanceTypesInDev = [
  'db.t4g.micro', 'db.t4g.small'
]

const auroraRdsRecommendInstanceTypesInDev = [
  'db.t4g.medium'
]

module.exports = {
  mrTemplates,
  mrTemplatesMsk,
  rdsRecommendInstanceTypesInDev,
  auroraRdsRecommendInstanceTypesInDev,
  rdsConfiguration,
  links,
  recommendedRDSStorageTypes
};
