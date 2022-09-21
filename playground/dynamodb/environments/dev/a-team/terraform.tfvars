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
      # https://hollandandbarrett.slack.com/archives/CKCRFQMU1/p1663764642618809 message
      # I have added a new column to the existing GSI "combinedPromotionName"
      # \"Cannot update GSI's properties other than Provisioned Throughput and Contributor Insights Specification. You can create a new GSI with a different name.\"
      # What to do > Remove GCI key in one MR and create a new MR with new values
      non_key_attributes = ["promotionName", "id", "statusType", "promotionStart", "promotionEnd"] # to add "combinedPromotionName"
    }
  ]

  autoscaling_policies = []

  tags = {
    team = "checkout"
  }
}
