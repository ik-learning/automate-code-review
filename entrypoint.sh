#!/bin/sh

set -x

: "$WORK_DIR"
: "$DANGER_GITLAB_HOST"

echo "$PWD"
export CURRENT_FOLDER="$PWD"

cd "$WORK_DIR"

echo $PWD
yarn danger ci --dangerfile $CURRENT_FOLDER/dangerfile.js --removePreviousComments
