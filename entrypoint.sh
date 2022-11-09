#!/usr/bin/env bash

set -e

: "$WORK_DIR"
: "$DANGER_GITLAB_HOST"
: "$TRIGGER_PAYLOAD"
: "$CI_JOB_URL"
: "$CI_PIPELINE_IID"

cd "$WORK_DIR"
yarn danger --version
# yarn danger ci --dangerfile $CURRENT_FOLDER/dangerfile.js --removePreviousComments

export DANGER_FAKE_CI="YEP"
export DANGER_TEST_REPO=$(cat $TRIGGER_PAYLOAD | jq -r '.object_attributes.target.path_with_namespace')
export DANGER_TEST_PR=$(cat $TRIGGER_PAYLOAD | jq -r '.object_attributes.iid')
export DANGER_PR_URL=$(cat $TRIGGER_PAYLOAD | jq -r '.object_attributes.url')
export MR_STATE=$(cat $TRIGGER_PAYLOAD | jq -r .object_attributes.state)
export MR_STATUS=$(cat $TRIGGER_PAYLOAD | jq -r .object_attributes.merge_status)
export MR_ACTION=$(cat $TRIGGER_PAYLOAD | jq -r .object_attributes.action)
export MR_TITLE=$(cat $TRIGGER_PAYLOAD | jq -r .object_attributes.title)

echo "==================================="
echo "BUNDLE VERSION: $VERSION"
echo "DANGER_TEST_REPO: $DANGER_TEST_REPO"
echo "DANGER_TEST_PR: $DANGER_TEST_PR"
echo "DANGER_PR_URL: $DANGER_PR_URL"
echo "MR Title: '${MR_TITLE}'. Skip when contains '[skip ci]'."
echo "MR State: '${MR_STATE}'. Skip when state is not 'opened'."
echo "MR Action: '${MR_ACTION}'. Skip when 'approved'."
echo "MR Merge Status: ${MR_STATUS}. Skip when not 'can_be_merged'."
echo "==================================="

if [[ $DANGER_PR_URL != *"/platform-as-a-service/test-projects/"* ]] && [[ $MR_TITLE != *"[skip ci]"* ]]; then
  if [ $MR_STATE == "opened" ] && [ $MR_STATUS == "can_be_merged" ] && [ $MR_ACTION != "approved" ]; then
    # yarn danger ci --id $(uuidgen)
    yarn danger ci --removePreviousComments
  else
    echo -e "skip MR review"
  fi
fi
