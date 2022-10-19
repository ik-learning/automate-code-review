#!/bin/sh

set -e

: "$WORK_DIR"
: "$DANGER_GITLAB_HOST"
: "$TRIGGER_PAYLOAD"

cd "$WORK_DIR"
echo "VERSION: $VERSION"
yarn danger --version
# yarn danger ci --dangerfile $CURRENT_FOLDER/dangerfile.js --removePreviousComments

export DANGER_FAKE_CI="YEP"
export DANGER_TEST_REPO=$(cat $TRIGGER_PAYLOAD | jq -r '.object_attributes.target.path_with_namespace')
export DANGER_TEST_PR=$(cat $TRIGGER_PAYLOAD | jq -r '.object_attributes.iid')
export DANGER_PR_URL=$(cat $TRIGGER_PAYLOAD | jq -r '.object_attributes.url')

echo "DANGER_TEST_REPO: $DANGER_TEST_REPO. DANGER_TEST_PR: $DANGER_TEST_PR. DANGER_PR_URL: $DANGER_PR_URL"
echo $PWD
ls -la
yarn danger ci --removePreviousComments
