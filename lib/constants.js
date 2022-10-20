'use strict';

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

const mrTemplatesMsk = {
  add: 'Create Topic.md',
  update: 'Update Topic.md',
  remove: 'Delete Topic.md',
}

const links = {
  orgStructure: "https://hbidigital.atlassian.net/wiki/spaces/PPO/pages/5557846070/Tech+and+Product+Org+Structure"
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
    'delete': 'Default.md'
  },
  'kms': {
    'created': 'Create KMS Key.md',
    'modified': 'Update KMS Key.md',
    'delete': 'Delete KMS Key.md'
  },
  'rds': {
    'created': 'Create RDS instance.md',
    'modified': 'Update RDS instance.md',
    'delete': 'Default.md'
  },
  'rds-aurora': {
    'created': 'Create RDS Aurora cluster.md',
    'modified': 'Update RDS Aurora cluster.md',
    'delete': 'Default.md'
  },
  's3': {
    'created': 'Create S3 Bucket.md',
    'modified': 'Update S3 Bucket.md',
    'delete': 'Delete S3 Bucket.md'
  },
  'sso': {
    'created': 'Update SSO access.md',
    'modified': 'Update SSO access.md',
    'delete': 'Update SSO access.md'
  },
  'sns': {
    'created': 'Create SNS.md',
    'modified': 'Create SNS.md',
    'delete': 'Create SNS.md'
  },
  'sqs': {
    'created': 'Create SQS.md',
    'modified': 'Create SQS.md',
    'delete': 'Create SQS.md'
  },
  'vault': {
    'created': 'Default.md',
    'modified': 'Update Vault Configuration.md',
    'delete': 'Delete Vault Configuration.md'
  },
};

const rdsConfiguration = {
  postgres: {
    'engine': 'postgres',
    'engine_version': '14.4',
    'family': 'postgres14'
  },
  mysql: {
    'engine': 'mysql',
    'engine_version': '8.0.30',
    'family': 'mysql8.0'
  }
}

const rdsRecommendInstanceTypesInDev = [
  'db.t3.micro', 'db.t3.small', 'db.t4g.micro', 'db.t4g.small'
]

module.exports = {
  repo,
  prId,
  mrTemplates,
  mrTemplatesMsk,
  rdsRecommendInstanceTypesInDev,
  rdsConfiguration,
  links
};
