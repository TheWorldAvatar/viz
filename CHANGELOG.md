# TWA-VF Change Log

[//]: # 'Note that version headers need to start with "## " characters to be picked up by some automated scripts'

## 5.27.3

### Changes

- Updated the landing page design

### Bug Fixes

- Fix the enable and disable of the help page in ui-settings

## 5.27.2

### Changes

- Updated the user menu design

## 5.27.1

### Chores

- Dependabot update #201

## 5.27.0

###

- Initial test configuration using jest. Coverage to be extended

## 5.26.1

### Updates

- Dependabot update #196

## 5.26.0

### Updates

- Update node to v24

## 5.25.0

### Changes

- Addition of a file upload functionality with permissions to a target endpoint on the landing page
- Simplify page thumbnail code
- Created reusable tooltips, popovers, and modals using Floating UI
- Replaced all MUI tooltips and react-modal modals with the new floating elements
- Updated tooltip messages
- Removed react-modal library

### Bug fix

- Fix the console error when keycloak is disabled but user credentials are being fetched

## 5.24.5

### Bug fix

- Fix Not Applicable option behaviour in the registry's dropdown selector

## 5.24.4

### Changes

- Fix behaviour of scenario modal render

## 5.24.3

### Changes

- Depenabot bump #183

## 5.24.2

### Changes

- Simplify the form array code
- Refactor react-select into a reusable component

### Bug Fixes

- Ensure that the last row of a field array is now sent upon form submission
- Storage of dropdown state for instance selector when navigating between different items in the array

## 5.24.1

### Bug Fixes

- Fixed the non-human-readable attributes in the general registry table
- Ensure proper parsing of caption labels for general registry landing page redirect
- Updated captions for general registry in dictionary

## 5.24.0

### Changes

- Updated the form array design

## 5.23.0

### Changes

- Added a new numeric input component to facilitate granular steps and fixed values
- Updated the min max input field to the new component
- Updated min version of `VisBackend Agent` from `v1.4.0` to `v1.5.1`

### Bug Fixes

- Fixed the longitude and latitude fields in the form geocoder

## 5.22.4

- Dependabot update #173

## 5.22.3

- Security update of `react-router-dom`, see #171

## 5.22.2

### Changes

- Ignore authorisation in language middleware to prevent incorrect redirection when keycloak is deployed on the same host but different path to the main viz

## 5.22.1

### Changes

- Dependabot bump #163
- Update package manager version

## 5.22.0

### Changes

- Allow scenario modal to render on the client if server side scenario fetch fails
- Allow better closing behaviour of scenario modal
- Pass credentials where relevant
- Simplify some data fetching
- Simplify some scenario state management

## 5.21.0

### Changes

- Added role-based features using Keycloak
- Added a global login session using context
- Updated the existing UI display of Keycloak session to the new global session

## 5.20.3

### Changes

- Added filtering function in registry table

## 5.20.2

### Changes

- Store selected filterTimes in search form, only applicable for trajectory FIA queries

## 5.20.1

### Changes

- Dependency bumps outlined in #157

## 5.20.0

### Changes

- Patch issue introduced by updating to express 5.x
- Keycloak now defaults to protecting all pages. NB this is a breaking change if you previously had \* as a keycloak protected pages env variable. Remove it for this behaviour

## 5.19.1

### Changes

- Dependency bumps. See #151

## 5.19.0

### Changes

- Added internationalisation framework
- Support German and English translations

## 5.18.7

### Bug Fixes

- Fixed the form error when no node property is found in the form template

## 5.18.6

### Changes

- Refactor to work with new endpoint requirements
- Updated `VisBackend Agent` from `v1.3.0` to `v1.4.0`

## 5.18.5

- dependabot version bump #136
- add an `.nvmrc` for local node management
- update `pnpm`

## 5.18.4

### Changes

- Replaced MUI registry table to Antd

## 5.18.3

### Improvements

- dependency bumps

## 5.18.2

### Bug Fixes

- Fix type errors introduced in v5.18.1

## 5.18.1

### Changes

- Added a tooltip to inform users of an action button's actions

## 5.18.0

### Changes

- Added a simple registry pages to view records of entities specified in the configuration

## 5.17.3

- Dependabot version updates

## 5.17.2

- Update node version

## 5.17.1

### Security Update

- Bump version of `axios` to address server side forgery vulnerability

## 5.17.0

### Changes

- Added form branches and arrays
- Added option to generate report
- Updated form extraction workflow following changes in the backend
- Consolidation of form parsing methods
- Improve dark mode design for the registry
- Abstracted background image into a hook
- Updated `VisBackend Agent` from `v1.2.2` to `v1.3.0`

### Bug Fixes

- Fix missing functions for action buttons

## 5.16.15

### Bug Fixes

- Fix missing dependent form field if no instances are found

## 5.16.14

### Improvements

- Updated design for the registry table and forms

## 5.16.13

### Changes

This PR was created by the Combine PRs action by combining the following PRs:

- #106 build(deps-dev): bump eslint from 9.20.0 to 9.21.0 in /code
- #105 build(deps): bump @mui/material from 6.4.3 to 6.4.5 in /code
- #104 build(deps-dev): bump globals from 15.14.0 to 16.0.0 in /code
- #102 build(deps): bump actions/github-script from 6 to 7
- #101 build(deps): bump node from 23.7-slim to 23.8-slim

## 5.16.12

### Bug Fixes

- Account for multiple time series returned by the feature info agent

## 5.16.11

### Improvements

- Updated design of registry table
- Change the default row size for registry
- Added a simple no results found overlay

## 5.16.10

### Bug Fixes

- Fix missing time series panel when only time series data is returned with no attributes

## 5.16.9

### Bug Fixes

- Fix the bug that prevents the display of dependent form fields with conflicting similar names

## 5.16.8

### Improvements

- Address unused imports warned by ESLint

## 5.16.7

### Changes

- Bump next.js, mapbox and several other dependencies

### Bug Fixes

- Fixed issue with metadata display for number values

## 5.16.6

### Changes

- Bump dependencies:
  - `material-symbols`
  - `react-select`
  - `@next/eslint-plugin-next`
- Remove redundant `react-map-gl` dependency

## 5.16.5

### Changes

- Update pnpm and node versions in package.json

## 5.16.4

### Changes

- Update node base image from 22.11 to 23.7

## 5.16.3

## Bug fixes

- Fixes issue where FIA responses were not decoded if not in 'utf-8'

## 5.16.2

### Changes

- Minor dependency bump of reduxjs, ESLint, uuid

## 5.16.1

### Bug Fixes

- Add missing context provider for form geocoder map

## 5.16.0

### Improvements

- Added contract information for each task
- Added feature to retrieve form template for each stage or event transition eg cancel, dispatch, or completed
- Improve the transition between different events from receiving a new order, assigning dispatch information, and completing the services
- Added a summary page to show tasks associated with one contract
- Separate pages

### Bug Fixes

- Fix csv export of data by exporting the data directly instead of using a backend API

## 5.15.3

### Improvements

- Add an option to 'map-settings.ui' to allow place labels be hidden by default
- Add a context provider for mapbox settings
- Add current year to the footer
- Improve toggled map control style

## 5.15.2

### Improvements

- Dependency upgrades

## 5.15.1

### Improvements

- Patch to previous PR that removed ESLint's ajv dependency override

## 5.15.0

### Improvements

- Major update of next and ESLint to improve code quality and optimisation

## 5.14.2

### Improvements

- Minor version bumps from dependabot

### Bug Fixes

- Fix empty catch statement in `mapbox-container.tsx` preventing build

## 5.14.1

### Improvements

- Improve CI actions and rename package

## 5.14.0

### Features

- Added optional specification to a mapbox layer to have it refresh periodically

## 5.13.0

### Features

- Added use of lifecycle in registry
- Removal of scheduler configuration, which is part of the new lifecycle
- General enhancements to forms in the registry

### Bug Fixes

- Fixed mapbox token not being read in development environment

## 5.12.0

- Add ability to include JWT token in header for MapBox source requests.

## 5.11.1

### Bug Fixes

- Fixed links to optional pages behind nginx

## 5.11.0

### Improvements

- Simplify, secure and optimise MapBox credential management by loading in as environment variables instead of exposing via public API and using HTTP to read them
- Add a "layerTreeIconOverride" option to mapbox layers for cases where automatic icon is not wanted
- Update several packages, including a breaking version change of mapbox gl-js
- Update node to last LTS of v22, with a view to move to v23 when webpack dependencies can be resolved

### Bug Fixes

- Fix tooltip on ribbon remaining engaged on dropdown menu
- Change default from 3D maps to 2D maps
- Correctly find landing page icon
- Properly sanitize icons passed to mapbox with ASSET_PREFIX

## 5.10.0

### Features

- Added customisable search capabilities for the map visualisation, inclusive of metadata and time series
- Improve the search form design and user interaction
- Added geocoding capabilities
- Added documentation of these functions

### Bug Fixes

- Fix bad state calls in map container
- Fix some of the errors logged in the console

## 5.9.2

### Improvements

- Updated Keycloak connector to latest version v26

### Bug Fixes

- Resolved bug causing unexpectesd logouts from Keycloak due to next prefetching.

## 5.9.1

### Features

- Added CMCL logo to default icons library

## 5.9.0

### Bug Fixes

- Read in `ASSET_PREFIX` environment variable and write it to next.js asset prefix and basepath to fix static resources behind double nginx

## 5.8.1

### Bug Fixes

- Fix production build issues

## 5.8.0

### Features

- Added sorting, filters and other functions to the registry table
- Improve user interactions and experience in the registry table
- Improve user interactions with the schedule form sections and the form in general

## 5.7.0

### Bug Fixes

- Random logouts when keycloak authentication is enabled
- Role based authorisation was broken behind docker

### Changes

- Updated various package dependencies to latest versions

## 5.6.0

### Features

- Extension of the form UI for search capabilities
- Addition of initial search capabilities for the map visualisation\* Addition of time slots for the form schedule section
- Modify the registry to work with the new vis backend agent
- Consolidation of the urls of assets as constants in one file

### Bug Fixes

- Fix the form's css

## 5.5.0

### Features

- Addition of the registry pages, enabling users to view, create, edit, and remove records from the knowledge graph
- Addition of scheduling capabilities for the specific registry pages
- Users can deploy multiple navbar logos
- Improvements to the handling and structure of configuration settings and pages
- Improvements to the documentation and tutorial

### Bug Fixes

- Fix the development mode in a Docker container
- Improve user experience if modules are disabled by redirecting back to homepage

## 5.4.0

### Features

- Viz app can now be secured behind a Keycloak authentication server by configuring some environment variables. See main documentation of the project 1.1
- Dependency management and build process optimised by using pnpm over npm for the project.
- Docker build optimised with multi stage building and module caching
- Rebuild should only occur if a change in a config file is detected
- Some dependency updating and trimming down
- NB there no longer two places to mount config files and media. All config files should go in `web/twa-vis-platform/code/public` and NOT `web/twa-vis-platform/uploads`

## 5.3.3

### Bug Fixes

- Fix tooltips in ribbon

## 5.3.2

### Bug Fixes

- Fix bug where sidepanel info did not show the correctly time indexed data
- Side panel now re-queries when dimension is changed
- Minor styling changes on scenario selector to fix weird icon scaling
- Better layer tree and ribbon display on mobile

## 5.3.1

### Features

- Scenario selection button now displays current scenario

### Bug Fixes and Improvements

- Several major updates in dependencies
- Dev dependencies no longer shipped with production, reducing number of node packages installed inside the container by ~66%

## 5.3.0

### Features

- Mostly CReDo focused features including:
- Dimension slider displayed in scenario if dimensions are returned from central stack
- Added order and clickable configuration and functionality from TWA-VF 4
- Added ability to perform subqueries for feature information in parts
- RTK query for central stack
- Redesigned controls ribbon
- Customisable landing page image
- Customisable toolbar logo
- Improvements to info and layer tree

### Bug Fixes

- Map events and data are now registered and removed when changing scenarios
- Added a placeholder for the feature selector's dropdown options so that the first option can now be selected as well
- Redirects correctly to the map page when landing page is disabled
- Improved page routing with more robust relative paths in routes
- Various issues and improvements listed in [#1246](https://github.com/cambridge-cares/TheWorldAvatar/issues/1246)

## 5.2.0

### Features

- Embedding of dashboard using the "dashboard" parameter in settings.json
- Multiple data.json can be ingested using the new data-setting.json
- Improve dark mode design for some features
- Addition of "grouping" parameter within data.json to allow alternate views of the same source layer
- Addition of "hover" parameter within data.json to create hovering effect for the specified layer if enabled
- Added feature selector to manage multiple closely-positioned features

### Bug Fixes

- Fix missing metadata display
- Fix error when layers use expressions to retrieve their icon image or line colors
- Fix the parsing of RDF literals returned by Feature Info Agent

## 5.1.1

### Bug Fixes

- Minor config file fixes for development environment

## 5.1.0

### Features

- Added a developer tutorial for deploying the platform
- Added a help center for web platform usage
- Added a style guide for developers
- Redesign landing page buttons for coherency and added mapbox controls

## 5.0.2

### Bug Fixes

- Removed dependecy on vulnerable `requests` package

## 5.0.1

### Features

- _No features present._

### Bug Fixes

- As intended, map layers retain current state even as users switch away from the layer tree
- As intended, map layers will reset to default when switching pages

## 5.0.0

### Features

- Release of The World Avatar Visualisation Platform
- New directory for this framework at /web/twa-vis-platform
- Old version is available and supported during the transition

### Bug Fixes

- \_No bug fixes present.
