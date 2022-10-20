region      = "eu-west-1"
environment = "dev"

tags = {
  team        = "seller-experience"
  application = "notifier"
}

rds_config = {
  instance_config = {
    allow_major_version_upgrade         = false
    apply_immediately                   = true
    identifier                          = "seller-experience-notifier"
    engine                              = "mysql"
    engine_version                      = "5.7"
    family                              = "mysql5.7"
    instance_class                      = "db.t3.micro"
    storage_type                        = "gp2"
    allocated_storage                   = "20"
    multi_az                            = false
    backup_retention_period             = 1
    iam_database_authentication_enabled = false
    deletion_protection                 = true
    monitoring_interval                 = 0
    skip_final_snapshot                 = false
    max_allocated_storage               = 0
    performance_insights_enabled        = true
  }
  database_config = {
    name                = "main"
    master_user         = "masteruser"
    db_users            = ["admin"]
    port                = "3306"
    postgres_extensions = {}
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
