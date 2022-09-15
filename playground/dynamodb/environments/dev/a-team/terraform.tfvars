region      = "eu-west-1"
environment = "dev"

dynamodb_table = {
  name                   = "checkout-orchestration"
  billing_mode           = "PAY_PER_REQUEST"
  read_capacity          = null
  write_capacity         = null
  hash_key               = "id"
  range_key              = ""
  stream_enabled         = false
  stream_view_type       = ""
  server_side_encryption = true
  point_in_time_recovery = false

  attributes = {
    "id"            = "S"
    "basketId"      = "S"
    "customerId"    = "S"
    "customerEmail" = "S"
  }

  ttl = {
    attribute_name = "expiry_time"
    enabled        = true
  }

  local_secondary_indexes = []

  global_secondary_indexes = [
    {
      name               = "idx_by_basket_id"
      hash_key           = "basketId"
      projection_type    = "KEYS_ONLY"
      range_key          = ""
      read_capacity      = null
      write_capacity     = null
      non_key_attributes = []
    },
    {
      name               = "idx_by_customer_id"
      hash_key           = "customerId"
      projection_type    = "KEYS_ONLY"
      range_key          = "id"
      read_capacity      = null
      write_capacity     = null
      non_key_attributes = []
    },
    {
      name               = "idx_by_customer_email"
      hash_key           = "customerEmail"
      projection_type    = "KEYS_ONLY"
      range_key          = "id"
      read_capacity      = null
      write_capacity     = null
      non_key_attributes = []
    }
  ]

  autoscaling_policies = []

  tags = {
    team = "checkout"
  }
}
