#!/bin/sh

set -e

: "$WORK_DIR"
: "$DANGER_GITLAB_HOST"

export CURRENT_FOLDER="$PWD"
cd "$WORK_DIR"
yarn danger ci --dangerfile $CURRENT_FOLDER/dangerfile.js --removePreviousComments
