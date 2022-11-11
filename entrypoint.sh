#!/usr/bin/env bash

set -e
# nocasematch shell option for non caseinsensitive regex match
shopt -s nocasematch

: "$WORK_DIR"
: "$DANGER_GITLAB_HOST"
: "$TRIGGER_PAYLOAD"
: "$CI_JOB_URL"
: "$CI_PIPELINE_IID"

cd "$WORK_DIR"
yarn danger --version
# yarn danger ci --dangerfile $CURRENT_FOLDER/dangerfile.js --removePreviousComments

### Bold
BBlack='\033[1;30m'       # Black
BRed='\033[1;31m'         # Red
BGreen='\033[1;32m'       # Green
BYellow='\033[1;33m'      # Yellow
BBlue='\033[1;34m'        # Blue
BPurple='\033[1;35m'      # Purple
BCyan='\033[1;36m'        # Cyan
BWhite='\033[1;37m'       # White

NOCOLOR="\033[0m"

export DANGER_FAKE_CI="YEP"
export DANGER_TEST_REPO=$(cat $TRIGGER_PAYLOAD | jq -r '.object_attributes.target.path_with_namespace')
export DANGER_TEST_PR=$(cat $TRIGGER_PAYLOAD | jq -r '.object_attributes.iid')
export DANGER_PR_URL=$(cat $TRIGGER_PAYLOAD | jq -r '.object_attributes.url')
export MR_STATE=$(cat $TRIGGER_PAYLOAD | jq -r .object_attributes.state)
export MR_STATUS=$(cat $TRIGGER_PAYLOAD | jq -r .object_attributes.merge_status)
export MR_STATUS_DETAILED=$(cat $TRIGGER_PAYLOAD | jq -r .object_attributes.detailed_merge_status?)
export MR_ACTION=$(cat $TRIGGER_PAYLOAD | jq -r .object_attributes.action)
export MR_TITLE=$(cat $TRIGGER_PAYLOAD | jq -r .object_attributes.title)
export MR_USER_NAME=$(cat $TRIGGER_PAYLOAD | jq -r .user.name)

echo "==================================="
echo "BUNDLE VERSION: '${VERSION}'"
echo "DANGER_TEST_REPO: '${DANGER_TEST_REPO}'"
echo "DANGER_TEST_PR: '${DANGER_TEST_PR}'"
echo "DANGER_PR_URL: '${DANGER_PR_URL}'"
echo "USER NAME: '${MR_USER_NAME}'"
echo "MR Title: '${MR_TITLE}'. Skip when contains '[skip ci]'."
echo "MR State: '${MR_STATE}'. Skip when state is not 'opened'."
echo "MR State Detailed: '${MR_STATUS_DETAILED}'. Skip when state is 'mergeable'."
echo "MR Action: '${MR_ACTION}'. Skip when 'approved'."
echo "MR Merge Status: '${MR_STATUS}'. Skip when not 'can_be_merged'."
echo "==================================="

# https://docs.gitlab.com/ee/api/merge_requests.html merge requests
# https://docs.gitlab.com/ee/api/merge_requests.html#merge-status merge status

if [[ $MR_ACTION == "unapproved" ]] || [[ $MR_ACTION == "approved" ]]; then
  echo -e "${BYellow}skip MR review.${NOCOLOR}"
  echo -e "${BPurple}MR Action: '${MR_ACTION}'. Skip when 'approved|unapproved'.${NOCOLOR}"
  exit 1
fi

if [[ $DANGER_PR_URL == *"/platform-as-a-service/test-projects/"* ]] || [[ $MR_TITLE == *"[skip ci]"* ]]; then
  echo -e "${BYellow}skip MR review.${NOCOLOR}"
  echo -e "${BPurple}Skip when '[skip ci]' or project is in 'test-projects'.${NOCOLOR}"
  exit 1
fi

if [[ $MR_STATE == "merged" ]]; then
  echo -e "${BYellow}skip MR review.${NOCOLOR}"
  echo -e "${BPurple}Skip when '$MR_STATE' is 'merged'.${NOCOLOR}"
  exit 1
fi

if [[ $MR_STATUS != "preparing" ]] && [[ $MR_STATUS != "can_be_merged" ]]; then
  echo -e "${BYellow}skip MR review.${NOCOLOR}"
  echo -e "${BPurple}MR Status: '${MR_STATUS}'. Skip when not 'preparing|can_be_merged'.${NOCOLOR}"
  exit 1
fi

if [[ $MR_USER_NAME =~ "bot" ]]; then
  echo -e "${BYellow}skip MR review.${NOCOLOR}"
  echo -e "${BPurple}MR User Nanme: '${MR_USER_NAME}'. Skip when is a 'bot'.${NOCOLOR}"
  exit 1
fi

# experimental, no exit yet
if [[ $MR_STATUS_DETAILED == "mergeable" ]]; then
  echo -e "${BYellow}skip MR review.${NOCOLOR}"
  echo -e "${BPurple}MR State Detailed: '${MR_STATUS_DETAILED}'. Skip when 'mergeable'.${NOCOLOR}"
  exit -e "${BCyan}Experimental. Shouldd skip after trial${NOCOLOR}"
fi

if [[ $MR_STATE == "opened" ]]; then
  # yarn danger ci --id $(uuidgen) --removePreviousComments
  yarn danger ci --removePreviousComments
else
  echo -e "${BGreen}skip MR review.${NOCOLOR}"
fi
