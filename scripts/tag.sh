#!/usr/bin/env bash

VERSION=`cat package.json | jq -r .version`
echo "Add tag $VERSION"
git tag -a $VERSION -m "Release version $VERSION." || { echo "Failed to tag"; exit 1; }
echo "Push tag $VERSION"
git push origin $VERSION || { echo "Failed to push tag."; exit 1; }