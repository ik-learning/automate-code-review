region      = "eu-west-1"
environment = "dev"

tags = {
  team        = "composer"
  application = "seo-api"
}

rds_config = {
  instance_config = {
    allow_major_version_upgrade         = false
    apply_immediately                   = true
    identifier                           = "composer-seo-api"
    engine                              = "postgres"
    engine_version                      = "14.4"
    family                              = "postgres14"
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
  database_config = {
    name                = "main"
    master_user         = "masteruser"
    db_users            = ["admin"]
    port                = "5432"
    postgres_extensions = {}
  }
  maintenance_config = {
    maintenance_window = "Mon:00:00-Mon:03:00"
    backup_window      = "03:00-06:00"
  }
  access = {
    allowed_cidrs = []
  }
  parameters = {}
}
