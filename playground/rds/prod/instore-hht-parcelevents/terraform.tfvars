region      = "eu-west-1"
environment = "prod"

tags = {
  team        = "instore"
  application = "hht-parcelevents"
}

rds_config = {
  instance_config = {
    allow_major_version_upgrade         = false
    apply_immediately                   = true
    identifier                          = "instore-hht-parcelevents"
    engine                              = "postgres"
    engine_version                      = "13.7"
    family                              = "postgres13"
    instance_class                      = "db.t3.small"
    storage_type                        = "gp2"
    allocated_storage                   = "50"
    multi_az                            = false
    backup_retention_period             = 1
    iam_database_authentication_enabled = false
    deletion_protection                 = true
    monitoring_interval                 = 30
    performance_insights_enabled        = true
    skip_final_snapshot                 = false
    max_allocated_storage               = 0
  }
  database_config = {
    name                = "main"
    master_user         = "masteruser"
    db_users            = ["admin"]
    port                = "5432"
    postgres_extensions = {}
  }
  maintenance_config = {
    maintenance_window = "Mon:00:00-Mon:03:00"
    backup_window      = "03:00-05:00"
  }
  access = {
    allowed_cidrs = ["10.1.16.0/20", "10.1.192.0/19"]
  }
  parameters = {}
}
