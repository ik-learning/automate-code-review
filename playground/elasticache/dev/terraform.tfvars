region      = "eu-west-1"
environment = "dev"

cluster = {
  name                       = "product-api"
  apply_immediately          = true
  automatic_failover_enabled = true
  engine_version             = "6.x"
  engine_family              = "redis6.x"
  node_type                  = "cache.t3.large"
  port                       = 6379
  number_cache_clusters      = 2
  maintenance_window         = null
  snapshot_window            = null
  snapshot_retention_limit   = null
  transit_encryption_enabled = false
  auth_enabled               = ""
  allowed_cidrs              = []
  tags = {
    team        = "search"
    application = "product-api"
  }
  cluster_mode    = null
  parameter_group = {}
}
