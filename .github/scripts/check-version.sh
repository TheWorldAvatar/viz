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

# Check that there's no -SNAPSHOT qualifier and that the version follows the semantic versioning pattern
if ! [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo -e "\e[31mError\e[0m: VERSION must follow the semantic versioning pattern x.y.z where x, y, and z are numbers"
    exit 1
fi

# Check that the new version is incremented correctly
IFS='.' read -r -a MAIN_VERSION_PARTS <<<"$MAIN_VERSION"
IFS='.' read -r -a VERSION_PARTS <<<"$VERSION"

# Check for valid patch increment (x.y.z+1)
PATCH_INCREMENT=$((MAIN_VERSION_PARTS[2] + 1))
if [ "${VERSION_PARTS[0]}" -eq "${MAIN_VERSION_PARTS[0]}" ] &&
    [ "${VERSION_PARTS[1]}" -eq "${MAIN_VERSION_PARTS[1]}" ] &&
    [ "${VERSION_PARTS[2]}" -eq "$PATCH_INCREMENT" ]; then
    VALID_INCREMENT=true
fi

# Check for valid minor increment (x.y+1.0)
MINOR_INCREMENT=$((MAIN_VERSION_PARTS[1] + 1))
if [ "${VERSION_PARTS[0]}" -eq "${MAIN_VERSION_PARTS[0]}" ] &&
    [ "${VERSION_PARTS[1]}" -eq "$MINOR_INCREMENT" ] &&
    [ "${VERSION_PARTS[2]}" -eq 0 ]; then
    VALID_INCREMENT=true
fi

# Check for valid major increment (x+1.0.0)
MAJOR_INCREMENT=$((MAIN_VERSION_PARTS[0] + 1))
if [ "${VERSION_PARTS[0]}" -eq "$MAJOR_INCREMENT" ] &&
    [ "${VERSION_PARTS[1]}" -eq 0 ] &&
    [ "${VERSION_PARTS[2]}" -eq 0 ]; then
    VALID_INCREMENT=true
fi

if [ "$VALID_INCREMENT" != true ]; then
    echo -e "\e[31mError\e[0m: VERSION must be properly incremented. Valid increments are: patch (x.y.z+1), minor (x.y+1.0), or major (x+1.0.0)"
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

echo -e "\e[32mVersion incremented\e[0m, compose file and package.json updated. Next step in this action will commit the changes"

exit 0
