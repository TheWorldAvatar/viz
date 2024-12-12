#!/bin/bash

VERSION=$(cat -s "VERSION" 2>/dev/null)
MAIN_VERSION=$(curl -s "https://raw.githubusercontent.com/TheWorldAvatar/viz/main/VERSION")

if [ "$VERSION" == "" ]; then
    echo -e "\e[31mError\e[0m: VERSION file is empty. Please ensure the correct version number is written here. Version currently on main is: $MAIN_VERSION"
    exit 1
fi
echo "Version set in this PR: $VERSION"
echo "Version on main: $MAIN_VERSION"

# Get the VERSION file from the main branch of the repo, check that this new version is updated ie does not match
if [ "$VERSION" == "$MAIN_VERSION" ]; then
    echo -e "\e[31mError\e[0m: VERSION specified on this branch matches that on main. Update the VERSION file before merging."
    exit 1
fi

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

# Update version in code/package.json
PACKAGE_JSON="code/package.json"
if [ -f "$PACKAGE_JSON" ]; then
    sed -i -E "s/\"version\": \"[^\"]+\"/\"version\": \"$VERSION\"/" "$PACKAGE_JSON"
    echo "Updated version in $PACKAGE_JSON to $VERSION"
else
    echo -e "\e[31mError\e[0m: $PACKAGE_JSON not found"
    exit 1
fi

# Update image version in docker-compose.yml
DOCKER_COMPOSE="docker-compose.yml"
if [ -f "$DOCKER_COMPOSE" ]; then
    sed -i.bak -E "s|(image: .+:).+|\1$VERSION|" "$DOCKER_COMPOSE" && rm "$DOCKER_COMPOSE.bak"
    echo "Updated image version in $DOCKER_COMPOSE to $VERSION"
else
    echo -e "\e[31mError\e[0m: $DOCKER_COMPOSE not found"
    exit 1
fi

git config --global user.email "viz-bot@noreply.theworldavatar.io"
git config --global user.name "twa-viz-bot"
git add "$PACKAGE_JSON" "$DOCKER_COMPOSE"
git commit -m "Update version to $VERSION in package.json and docker-compose.yml"
git push

echo -e "\e[32mVersion incremented\e[0m, compose file and package.json updated"

exit 0
