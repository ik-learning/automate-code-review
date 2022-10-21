#!/bin/sh

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
export MR_TITLE=$(cat $TRIGGER_PAYLOAD | jq -r .object_attributes.title)

echo "==================================="
echo "BUNDLE VERSION: $VERSION"
echo "DANGER_TEST_REPO: $DANGER_TEST_REPO"
echo "DANGER_TEST_PR: $DANGER_TEST_PR"
echo "DANGER_PR_URL: $DANGER_PR_URL"
echo "MR Title: ${MR_TITLE}"
echo "MR State: ${MR_STATE}"
echo "==================================="

if [ $MR_STATE == "opened" ] || [[ !$MR_TITLE =~ "[skip ci]" ]]; then
  yarn danger ci --id $(uuidgen)
else
  echo -e "skip MR review"
fi
