#!/bin/bash

VERSION=$(cat -s "VERSION" 2>/dev/null)
MAIN_VERSION=$(curl -s "https://raw.githubusercontent.com/TheWorldAvatar/viz/main/VERSION")

if [ "$VERSION" == "" ]; then
    echo -e "\e[31mError\e[0m: VERSION file is empty. Please ensure the correct version number is written here. Version currently on main is: $MAIN_VERSION"
    exit 1
fi
echo "Version set in this PR: $VERSION"

# Get the VERSION file from the main branch of the repo, check that this new version is updated ie does not match
if [ "$VERSION" == "$MAIN_VERSION" ]; then
    echo -e "\e[31mError\e[0m: The TWA-ViP VERSION file on this branch matches that on the main branch! Update the VERSION file before merging."
    exit 1
fi
echo "Version previously on main: $MAIN_VERSION"

# Check that there's no -SNAPSHOT qualifier
TOKEN="-SNAPSHOT"
if [[ "$VERSION" == *"$TOKEN"* ]]; then
    echo -e "\e[31mError\e[0m: Remove the \"-SNAPSHOT\" qualifier in VERSION"
    exit 1
fi

# Check that the change log contains an entry for the updated versions
CHANGELOG="CHANGELOG.md"
TOKEN="# $VERSION"
if ! grep -q "$TOKEN" "$CHANGELOG"; then
    echo -e "\e[31mError\e[0m: Could not find corresponding entry for release $VERSION in CHANGELOG.md"
    exit 1
fi

echo -e "\e[32mVersion incremented\e[0m"

exit 0
