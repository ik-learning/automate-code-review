#!/bin/sh

set -e

: "$WORK_DIR"
: "$DANGER_GITLAB_HOST"
: "$TRIGGER_PAYLOAD"

# export CURRENT_FOLDER="$PWD"
cd "$WORK_DIR"
echo "VERSION: $VERSION"
yarn danger --version
# TODO: support cases when Danger file is required per -repository
# yarn danger ci --dangerfile $CURRENT_FOLDER/dangerfile.js --removePreviousComments

export DANGER_FAKE_CI="YEP"
export DANGER_TEST_REPO=$(cat $TRIGGER_PAYLOAD | jq '.object_attributes.target.path_with_namespace')
export DANGER_TEST_PR=$(cat $TRIGGER_PAYLOAD | jq '.object_attributes.target.iid')
export DANGER_PR_URL=$(cat $TRIGGER_PAYLOAD | jq '.object_attributes.target.url')
echo "$DANGER_TEST_REPO $DANGER_TEST_PR $DANGER_PR_URL"
ls -la
yarn danger ci --removePreviousComments
