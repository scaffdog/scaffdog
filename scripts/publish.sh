#!/bin/bash

git describe --exact-match

if [[ ! $? -eq 0 ]]; then
  echo "Nothing to publish, exiting.."
  exit 0;
fi

if [[ -z "$NPM_TOKEN" ]]; then
  echo "No NPM_TOKEN, exiting.."
  exit 0;
fi

echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" >> ~/.npmrc

if [[ $(git describe --exact-match 2> /dev/null || :) =~ -canary ]]; then
  echo "Publishing canary"
  yarn release:canary --yes
  if [[ ! $? -eq 0 ]]; then
    exit 1
  fi
else
  echo "Did not publish canary"
fi

if [[ ! $(git describe --exact-match 2> /dev/null || :) =~ -canary ]]; then
  echo "Publishing stable"
  yarn release --yes
  if [[ ! $? -eq 0 ]]; then
    exit 1
  fi

  echo "Sync the main branch with the canary branch"

  git fetch --depth=1 origin main
  if [[ ! $? -eq 0 ]]; then
    exit 1
  fi

  git fetch --depth=300 origin canary
  if [[ ! $? -eq 0 ]]; then
    exit 1
  fi

  git switch main
  if [[ ! $? -eq 0 ]]; then
    exit 1
  fi

  git reset --hard canary
  if [[ ! $? -eq 0 ]]; then
    exit 1
  fi

  git push origin main -f
  if [[ ! $? -eq 0 ]]; then
    exit 1
  fi
else
  echo "Did not publish stable"
fi
