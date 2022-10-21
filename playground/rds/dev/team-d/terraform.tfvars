environment = "dev"

tags = {
  description = "dev-db-restore"
}

rds_config = {
  instance_config = {
    allow_major_version_upgrade         = false
    apply_immediately                   = true
    identifier                           = "category-api-v2"
    engine                              = "postgres"
    engine_version                      = "13.7"
    family                              = "postgres13"
    instance_class                      = "db.t3.small"
    storage_type                        = "gp2"
    allocated_storage                   = "20"
    max_allocated_storage               = 0
    multi_az                            = false
    iam_database_authentication_enabled = false
    deletion_protection                 = true
    backup_retention_period             = 1
    skip_final_snapshot                 = false
    monitoring_interval                 = 0
    performance_insights_enabled        = true
  }
  maintenance_config = {
    maintenance_window = "Mon:00:00-Mon:03:00"
    backup_window      = "03:00-06:00"
  }
  access = {
    allowed_cidrs = ["10.1.16.0/20", "10.1.192.0/19"]
  }
  parameters = {}
}
restore_config = {
  snapshot = null
  pitr = {
    restore_time                  = "2022-10-20T12:00:00.000Z" // should be today!! for a bug to appear
    source_db_instance_identifier = "search-category-api"
  }
}

# message creating RDS DB Instance (restore to point-in-time) (category-api-v2): InvalidParameterValue: The specified instance cannot be restored to a time earlier than 2022-10-20T12:59:32Z because its backup retention period is set to 1 days.
