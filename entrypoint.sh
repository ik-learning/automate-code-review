#!/bin/sh

set -x

: "$WORK_DIR"

echo "$PWD"
export CURRENT_FOLDER="$PWD"

cd "$WORK_DIR"

echo $PWD

yarn danger ci --dangerfile $CURRENT_FOLDER/dangerfile.js --removePreviousComments
