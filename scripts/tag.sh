#!/usr/bin/env bash

VERSION=`cat package.json | jq -r .version`
echo "Check repo is clean"
git diff-files --quiet || { echo "Stash changes or discard unstaged changes"; exit 1; }
echo "Check staged changes have been committed"
git diff-index --quiet --cached HEAD -- || { echo "Uncommitted staged changes"; exit 1; }
echo "Add tag $VERSION"
git tag -a $VERSION -m "Release version $VERSION." || { echo "Failed to tag"; exit 1; }
echo "Push tag $VERSION"
git push origin $VERSION || { echo "Failed to push tag."; exit 1; }