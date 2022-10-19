#!/bin/sh

set -e

: "$WORK_DIR"
: "$DANGER_GITLAB_HOST"

# export CURRENT_FOLDER="$PWD"
cd "$WORK_DIR"
echo "VERSION: $VERSION"
yarn danger --version
# TODO: support cases when Danger file is required per -repository
# yarn danger ci --dangerfile $CURRENT_FOLDER/dangerfile.js --removePreviousComments
yarn danger ci --dangerfile dangerfile.js --removePreviousComments
