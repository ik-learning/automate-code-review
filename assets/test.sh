#!/bin/sh

set -e

PATH_TO_FILE=fixtures/merge-request.merged.json

export MR_STATE=$(cat $PATH_TO_FILE | jq -r .object_attributes.state)
export MR_TITLE=$(cat $PATH_TO_FILE | jq -r .object_attributes.title)
echo "==================================="
echo "MR Title: ${MR_TITLE}"
echo "MR State: ${MR_STATE}"
echo "==================================="

if [ $MR_STATE == "opened" ] && [[ ! $MR_TITLE =~ "[skip ci]" ]]; then
  echo "RUN MR review"
else
  echo "SKIP MR review"
fi
