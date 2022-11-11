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
  orgStructure: "https://hbidigital.atlassian.net/wiki/spaces/PPO/pages/5557846070/Tech+and+Product+Org+Structure",
  newIssue: "https://gitlab.com/HnBI/platform-as-a-service/test-projects/automate-code-review/-/issues"
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
    'engine_version': '14.5',
    'family': 'postgres14'
  },
  mysql: {
    'engine': 'mysql',
    'engine_version': '8.0.30',
    'family': 'mysql8.0'
  }
}

const rdsRecommendInstanceTypesInDev = [
  'db.t4g.micro', 'db.t4g.small'
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
