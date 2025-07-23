#!/bin/bash

# Function to display usage
usage() {
    echo "Usage: $0 {major|minor|patch|ready} [-s]"
    echo "  -s  Add SNAPSHOT qualifier"
    exit 1
}

# Check if at least one argument is provided
if [ $# -lt 1 ]; then
    usage
fi

# Read the current version from the VERSION file
VERSION=$(cat VERSION)

# Split the version into major, minor, and patch
IFS='.' read -r -a VERSION_PARTS <<<"${VERSION%-SNAPSHOT}"

# Handle the 'ready' argument to remove the SNAPSHOT qualifier
if [ "$1" == "ready" ]; then
    NEW_VERSION="${VERSION_PARTS[0]}.${VERSION_PARTS[1]}.${VERSION_PARTS[2]}"
    echo -n "$NEW_VERSION" >VERSION
    echo "Updated version to $NEW_VERSION"
    exit 0
fi

# Increment the version based on the argument
case $1 in
major)
    VERSION_PARTS[0]=$((VERSION_PARTS[0] + 1))
    VERSION_PARTS[1]=0
    VERSION_PARTS[2]=0
    ;;
minor)
    VERSION_PARTS[1]=$((VERSION_PARTS[1] + 1))
    VERSION_PARTS[2]=0
    ;;
patch)
    VERSION_PARTS[2]=$((VERSION_PARTS[2] + 1))
    ;;
*)
    usage
    ;;
esac

# Combine the version parts into the new version
NEW_VERSION="${VERSION_PARTS[0]}.${VERSION_PARTS[1]}.${VERSION_PARTS[2]}"

# Add snapshot qualifier if -s is passed
if [ "$2" == "-s" ]; then
    NEW_VERSION="${NEW_VERSION}-SNAPSHOT"
fi

# Save the new version to the VERSION file
echo -n "$NEW_VERSION" >VERSION

# Output the new version
echo "Updated version to $NEW_VERSION"
