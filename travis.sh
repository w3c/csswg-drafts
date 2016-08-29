#!/bin/bash

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

bikeshed Overview.bs index.html || error_exit "Error building spec"

if [ "$TRAVIS_PULL_REQUEST" == "false" ] && [ "$TRAVIS_BRANCH" == "master" ]; then
  git diff --exit-code || ok_exit "index.html is up to date"

  git config --global user.name "$COMMIT_USER (via Travis CI)"
  git config --global user.email "$COMMIT_EMAIL"

  export COMMIT_MESSAGE=$(echo -e "Running bikeshed on '$TRAVIS_COMMIT_MSG'\n\nGenerated from:\n";
                          git log $TRAVIS_COMMIT_RANGE)

  echo "$COMMIT_MESSAGE"
fi
