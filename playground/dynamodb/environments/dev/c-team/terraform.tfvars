region      = "eu-west-1"
environment = "dev"

dynamodb_table = {
  name                   = "offer-promotion"
  billing_mode           = "PAY_PER_REQUEST"
  read_capacity          = null
  write_capacity         = null
  hash_key               = "pk"
  range_key              = "sk"
  stream_enabled         = false
  stream_view_type       = ""
  server_side_encryption = true
  point_in_time_recovery = false

  attributes = {
    "pk"       = "S"
    "sk"       = "S"
    "folderId" = "S"
    "siteId"   = "S"
    "groupId"  = "S"
  }

  ttl = {
    attribute_name = "timeToLive"
    enabled        = true
  }

  local_secondary_indexes = []

  global_secondary_indexes = [
    {
      name               = "status_index"
      hash_key           = "sk"
      range_key          = ""
      projection_type    = "INCLUDE"
      read_capacity      = null
      write_capacity     = null
      non_key_attributes = ["folderName"]
    },
    {
      name               = "folder_index"
      hash_key           = "folderId"
      range_key          = "sk"
      projection_type    = "INCLUDE"
      read_capacity      = null
      write_capacity     = null
      non_key_attributes = ["statusType"]
    },
    {
      name               = "site_index"
      hash_key           = "siteId"
      range_key          = "sk"
      projection_type    = "INCLUDE"
      read_capacity      = null
      write_capacity     = null
      non_key_attributes = ["promotionName", "id", "statusType", "promotionStart", "promotionEnd", "combinedPromotionName"]
    },
    {
      name               = "group_index"
      hash_key           = "groupId"
      range_key          = "sk"
      projection_type    = "INCLUDE"
      read_capacity      = null
      write_capacity     = null
      non_key_attributes = ["statusType"]
    }
  ]

  autoscaling_policies = []

  tags = {
    team        = "offer"
    application = "promotion definition api"
  }
}

