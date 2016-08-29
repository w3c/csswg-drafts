#!/bin/bash
set -e

function error_exit
{
  echo -e "\e[01;31m$1\e[00m" 1>&2
  exit 1
}

function ok_exit
{
  echo -e "\e[01;32m$1\e[00m" 1>&2
  exit 0
}

bikeshed spec Overview.bs index.html || error_exit "Error building spec"

if [ "$TRAVIS_PULL_REQUEST" != "false" ] || [ "$TRAVIS_BRANCH" != "master" ]; then
  ok_exit "Pull request / commit to branch, not committing changes"
fi

git status .
git diff

if [ -z `git diff --exit-code` ]; then
  ok_exit "index.html is already up-to-date"
fi

REPO=`git config remote.origin.url`
SSH_REPO=${REPO/https:\/\/github.com\//git@github.com:}

git config --global user.name "$COMMIT_USER (via Travis)"
git config --global user.email "$COMMIT_EMAIL"

COMMIT_MESSAGE=$(echo -e "Running bikeshed on '$TRAVIS_COMMIT_MSG'\n\nGenerated from:\n";
               git log $TRAVIS_COMMIT_RANGE)

git commit -am "$COMMIT_MESSAGE"

# The following is based on: https://gist.github.com/domenic/ec8b0fc8ab45f39403dd
ENCRYPTED_KEY_VAR="encrypted_${ENCRYPTION_LABEL}_key"
ENCRYPTED_IV_VAR="encrypted_${ENCRYPTION_LABEL}_iv"
ENCRYPTED_KEY=${!ENCRYPTED_KEY_VAR}
ENCRYPTED_IV=${!ENCRYPTED_IV_VAR}
openssl aes-256-cbc -K $ENCRYPTED_KEY -iv $ENCRYPTED_IV -in deploy_key.enc -out deploy_key -d
chmod 600 deploy_key
eval `ssh-agent -s`
ssh-add deploy_key

echo "Pushing to $SSH_REPO"
git push $SSH_REPO master
echo "Done"
