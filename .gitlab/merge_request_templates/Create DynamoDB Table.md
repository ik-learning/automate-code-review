## Details

<!-- Describe the purpose of the DynamoDB table being created -->

<!-- Jira Story Link if any should go here -->

## Checklist

- [ ] Read the [DynamoDB confluence guidance](https://hbidigital.atlassian.net/wiki/spaces/PAAS/pages/861470767/Requesting%2Ba%2BNoSQL%2BDatabase%2BGuidance)
- [ ] Read the DynamoDB component [readme](../../blob/master/dynamodb/README.md)
- [ ] Read the DynamoDB supported [vars definitions](../../blob/master/dynamodb/terraform/vars.tf)
- [ ] No changes have been made to the Gitlab pipeline
- [ ] `Details` section above is updated with relevant information
- [ ] Created a directory under `dynamodb/environments/ENV/REGION/` following the naming convention (`TEAM-PROJECT`) defined in the confluence page
- [ ] Created a `terragrunt.hcl` file in the new `TEAM-PROJECT` directory created in the above step with the content specified in the [README](../../blob/master/dynamodb/README.md)
- [ ] Created a `terraform.tfvars` file in the new `TEAM-PROJECT` directory created in the above step
- [ ] Configured `terraform.tfvars` file for all variables defined in `dynamodb/terraform/vars.tf` using guidance in vars.tf and README
- [ ] Verified the `plan` job in the merge request pipeline to confirm only your DynamoDB table is going to be added and no other changes
