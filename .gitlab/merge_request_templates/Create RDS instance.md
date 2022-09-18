## Details

<!-- Describe the purpose of the RDS instance being created -->

<!-- Jira Story Link if any should go here -->

## Checklist

- [ ] Read the [RDS confluence guidance](https://hbidigital.atlassian.net/wiki/spaces/PAAS/pages/836173888/Requesting+a+SQL+Database+Guidance)
- [ ] Read the RDS component [readme](../../blob/master/rds/README.md)
- [ ] Read the RDS supported [vars definitions](../../blob/master/rds/terraform/vars.tf)
- [ ] No changes have been made to the Gitlab pipeline
- [ ] `Details` section above is updated with relevant information
- [ ] Created a directory under `rds/environments/ENV/REGION/` following the naming convention (`TEAM-PROJECT`) defined in the confluence page
- [ ] Created a `terraform.tfvars` file in the new `TEAM-PROJECT` directory created in the above step
- [ ] Created a `terragrunt.hcl` file in the new `TEAM-PROJECT` directory created in the above step with the content specified in the [README](https://gitlab.com/HnBI/platform-as-a-service/infrastructure/-/tree/master/rds/README.md#usage).
- [ ] Configured `terraform.tfvars` file for all variables defined in `rds/terraform/vars.tf` using guidance in vars.tf and [README](https://gitlab.com/HnBI/platform-as-a-service/infrastructure/-/tree/master/rds/README.md)
- [ ] Verified the `plan` job in the merge request pipeline to confirm only your RDS instance is going to be added and no other changes
- [ ] Acknowledge that team-based AWS SSO is in place and RDS user credentials will be fetched using the documented [credentials workflow](../../blob/master/rds/README.md#credential-workflow)
