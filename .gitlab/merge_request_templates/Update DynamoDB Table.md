## Details

<!-- Describe the purpose of the updates to the DynamoDB table -->

<!-- Jira Story Link if any should go here -->

## Checklist

- [ ] Read the [DynamoDB confluence guidance](https://hbidigital.atlassian.net/wiki/spaces/PAAS/pages/861470767/Requesting%2Ba%2BNoSQL%2BDatabase%2BGuidance)
- [ ] Read the DynamoDB component [readme](../../blob/master/dynamodb/README.md)
- [ ] Read the DynamoDB supported [vars definitions](../../blob/master/dynamodb/terraform/vars.tf)
- [ ] No changes have been made to the Gitlab pipeline
- [ ] `Details` section above is updated with relevant information
- [ ] Updated `terraform.tfvars` file for your table using guidance in vars.tf and README
- [ ] Confirm that the [table modification limitations](../../blob/master/dynamodb/README.md#table-modification-caveats) are taken into account for this update
- [ ] Verified the `plan` job in the merge request pipeline to confirm only your DynamoDB table is going to be updated with no other changes
