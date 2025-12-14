# TWA-VF Change Log

[//]: # 'Note that version headers need to start with "## " characters to be picked up by some automated scripts'

## 5.47.3

### Bug Fixes

- Fixed incorrect redirect to add, delete, edit forms

## 5.47.2

### Bug Fixes

- Fixed missing ribbon when keycloak is enabled

## 5.47.1

### Bug Fixes

- Added optional chaining to billingTypes in form utils that was causing errors when billingTypes was undefined

## 5.47.0

### Changes

- Added billing functionality
- Bump min version of `VisBackend Agent` to `v1.25.0`

## 5.46.2

### Changes

- Implemented archive and active pages for the jobs
- Implemented the terminate contract functinality
- Updated the layout of the Table ribbon
- Bump min version of `VisBackend Agent` to `v1.24.0`

## 5.46.1

### Changes

- Updated the date-input component to allow for multiple date selection
- New component - select-dates-input to display selected dates
- Implemented a new schedule type - "Fixed Date Service". This is a aservice that will occur on fixed dates within the specified period. Users can select multiple dates from the date picker.
- Bump min version of `VisBackend Agent` to `v1.22.0`

## 5.46.0

### Security

- _Critical security update_ to NextJS. All users should update to this version

## 5.45.5

### Bug fixes

- Fixed a bug where the sorting functionality was not working as expected, thus not returning the right sorting order.
- Added datatype check for every column when sorting to ensure correct sorting behavior for different data types (e.g., datetime, date).

## 5.45.4

### Bug fixes

- Transformed the task handling to use intercept routes. Removed the task modal.
- Bump min version of `VisBackend Agent` to `v1.21.1`

## 5.45.3

### Changes

- Added the functionality to send branch_add and branch_delete for form branching when you submit a form/request. This allows the backend to create or delete branches accordingly
- Bump min version of `VisBackend Agent` to `v1.21.0`

## 5.45.2

### Changes

- Added validation for geocoder coordinates to prevent map errors when invalid coordinates are provided
- Added validation for numerical inputs only in the geocoder form section

## 5.45.1

### Changes

- Added instructions for multi-column sorting, using Shift + Click

## 5.45.0

### Changes

- Shift towards server-side pagination and filters
- Bump min version of `VisBackend Agent` to `v1.19.0`

## 5.44.5

### Changes

- Add all parameters from the GeoServer layer to the request for the feature info agent

## 5.44.4

### Bug fixes

- Fixed overflow of the content in the quick view drop-down field

## 5.44.3

### Changes

- Added global loading state to show a loading indicator when navigating between pages

## 5.44.2

### Changes

- Added loading skeleton for the foerms to improve user experience during data fetching

## 5.44.1

### Bug Fixes

- Fixed a layout issue in the headerbar where the account menu and hambureger menu were misaligned

## 5.44.0

### Changes

- Improved redis connection failure handling for ease of debugging

## 5.43.7

### Changes

- Added a loading skeleton for the registry table to improve user experience during data fetching

## 5.43.6

### Bug Fixes

- Fixed an issue when reading JSONs and trying to determine the column headers of a table, all unique entries should be included

## 5.43.5

### Changes

- Fixed styling issue for mobile design (react-select dropdown not fully visible when its the last element in the form)
- Fixed the logo images not showing on some mobile devices or diffrent browsers due to the the width and height attributes being set to 0

## 5.43.4

### Bug Fixes

- Fixed an issue when adding a new job request with default "Waste Collection Service" that was throwing an error (missing contract parameter) due to a default NULL value being sent to the backend

## 5.43.3

### Bug Fixes

- Fixed an issue with the clear indicator in the column filter not showing after the table refreshes

## 5.43.2

### Changes

- Allow for a single or multiple contracts to be duplicated
- Implemented the functionality to specify the number of duplicates to create
- Bump min version of `VisBackend Agent` to `v1.18.0`

## 5.43.1

### Changes

- Implement a checkbox input that allows for selecting multiple rows in the registry table for bulk actions
- Implemented a bulking function in the registry table component that allows for multiple job approval and resubmit requests at the same time
- Added a select all checkbox in the registry table header to select all visible rows for bulk actions
- New checkbox component to be used across the application
- Bump min version of `VisBackend Agent` to `v1.17.0`

## 5.43.0

### Changes

- Global (Redux) loading state to show a toast notification when an operation is in progress
- Updating the disabled state of the buttons in all forms and tables
- Freeze the form and table interactions when an operation is in progress

## 5.42.9

### Bug Fixes

- Fixed the ontology concept selector to display the default value, if any, on an add form even after switching form branches
- Fixed the form branch to match based on nullable values as well when branches have overlapping fields

## 5.42.8

### Bug Fixes

- Fixed an issue with the status column filter options not working as expected in the registry table

## 5.42.7

### Changes

- Set the default date range for schedule task to be 28 days from tomorrow's date

## 5.42.6

### Changes

- Exclude "service_location" column from being displayed in the registry table

## 5.42.5

### Changes

- Increased the height of the horizontal scrollbar in the registry table

## 5.42.4

### Changes

- Implemented a textarea input
- Implemented a new component (Expandable table cell), which allows to expand long text in table cells
- Bump min version of `VisBackend Agent` to `v1.16.1`

## 5.42.3

### Bug Fixes

- Fixed and issue with the filter unmounting when the column toggle input is changed

## 5.42.2

### Changes

- Update display for last modified column and cell
- Bump min version of `VisBackend Agent` from `v1.15.1` to `v1.15.3`

## 5.42.1

### Bug Fixes

- Ensures that form submits an empty value for optional select fields when initialised
- Display dependent form fields even if independent form field has not been selected

## 5.42.0

### Bug Fixes

- Fixed 'fill' option for legend with a minor refactor

## 5.41.9

### Bug Fixes

- Enable full column selection per row

## 5.41.8

### Changes

- Made the Not Applicable option in the select dropdown to always be the default option if present

## 5.41.7

### Changes

- Improved mobile design for forms

## 5.41.6

### Changes

- Moved the drawer state to a global state

### Bug Fixes

- Fixed the issue with the drawer remains open when navigating on a different page
- Fixed the issue with the drawer not always being responsive (opening on click)

## 5.41.5

### Changes

- Fixed Issue with the layout of the icon in the export button date input and not closing when clicking outside when a date is selected

## 5.41.4

### Changes

- Improve form branching performance
- Rerender form fields when switching branches to prevent fields from being stuck
- Bump min version of `VisBackend Agent` from `v1.15.0` to `v1.15.1`

## 5.41.3

### Changes

- Created a wrapper function that gets the form values and passes them onto the onGeocoding function inside useGeocode hook
- This allows to skip the form validation when the geocoding button is pressed

## 5.41.2

### Bug Fixes

- Trigger automatic refresh of registry table on close for intercept form routes and actions

## 5.41.1

### Changes

- Added form validation for the drop down selectors for add form type
- Changed the default values of the simple selectors (empty placeholder)

## 5.41.0

### Changes

- Bump min version of `VisBackend Agent` from `v1.13.0` to `v1.15.0`
- Allow users to submit a perpetual service type
- Users will continue and duplicate the perpetual service by default on submission

## 5.40.4

### Bug Fixes

- Fixed the wrong filter option display for the status column in the registry

## 5.40.3

### Bug Fixes

- Fixed the issue with the disabled states of the single date input

## 5.40.2

### Changes

- Redone the date range component to accept single date selection as well as range selection
- Added a utility function to get the normalized date format in yyyy-mm-dd from a Date object

## 5.40.1

### Changes

- Removed the comma from the WKT point
- Removed the id column from the default column display in the registry table

## 5.40.0

### Changes

- Implemented a new quick view component that enables users to have a quick view of the dependent fields, without having to open a new tab or window.

## 5.39.6

### Changes

- Adjusted the form component to comply with Service type form branching logic, conditionally rendering form components based on a selected service type.

## 5.39.5

### Changes

- Changed the default type of the external links type to be "default" if not specified

## 5.39.4

### Changes

- Bump min version of `VisBackend Agent` from `v1.12.0` to `v1.13.0`
- Extended to allow users to resubmit for approval with changes to backend

## 5.39.3

### Bug Fixes

- Fixed false error message when changing service type of job
- Fixed approve button not working when pressed from the view form
- Fixed single service end date issue

## 5.39.2

### Changes

- Added a date range selection for exporting data
- Updated design of file upload

## 5.39.1

### Bug Fixes

- Fixed the inability to change months in the date input menu

## 5.39.0

### Changes

- Allow users to submit and duplicate their task for the next day via call to backend route.
- Added role permissions for saving and submit and duplicate tasks.
- Redesigned the permitted registry row actions in each registry.
- Bump min version of `VisBackend Agent` from `v1.10.0` to `v1.12.0`

## 5.38.4

### Changes

- Modified all geocoding property shapes retrieved from backend as optional shapes for form geocoding purposes

## 5.38.3

### Changes

- Changed the default service to be Single service rather than regular service
- Changed the default service time to be 00:00H to 23:58H

## 5.38.2

### Changes

- Redesigned the geocoding agent functionality
- Added a functionality to select an address directly from the map
- If a post code is selected, you can still manually select an address from the map

## 5.38.1

- Fix map layout on screen to fits

## 5.38.0

### Changes

- Added a functionality to save the completed form state before submission
- Bump min version of `VisBackend Agent` from `v1.9.2` to `v1.10.0`

## 5.37.1

### Changes

- Changed the location of the column drop-down menu and Clean filters button to the table ribbon
- Fixed layout issues in the table ribbon
- Made the date-range input icon only on mobile
- Moved all the table logic into custom hooks: useTable, useTableDnd, useFirstActiveFilter

## 5.37.0

### Changes

- Redesigned the form to show as a drawer on the right side for tablets and desktop
- Improved design for form on mobile
- Improved styling for various statuses, colors, modals
- Moved the registry submission to be a nested navigation tab in registry records
- Enable previous user sorting state to be saved temporarily
- Enable users to click on rows and open the drawer

### Bug Fixes

- Table filtering is now fully functional
- Fixed duplicate columns appearing
- Fixed missing actions in general registry

## 5.36.0

### Changes

- Implemented Tanstack Table
- Implemented Drag and drop functionality
- Implemented sorting and filtering functions in the table
- Implemented the functionality to show and hide columns in the table

## 5.35.0

### Chores

- Dependabot updates #286

## 5.34.8

### Chores

- Bump node version to 22.4

## 5.34.7

- Increased the font size of the registry pages
- Improved the layout of all pages. Now they take the full width of the container
- Improved the mobile view for all pages

## 5.34.6

- Changelog should now be present on the releases page automatically configured by GitHub
- Dockerfile no longer builds a development stage, workflow has migrated ot a devcontainer. See main README

## 5.34.5

### Bug Fixes

- Fixed caching of table action(s) for task modal

## 5.34.4

### Changes

- Bump min version of `VisBackend Agent` from `v1.9.0` to `v1.9.2`
- Rework viz to be compatible with `v1.9.2` of the `VisBackend Agent`
- Update German translations

### Bug Fixes

- Fixed date-time issue for registry date range submissions

## 5.34.3

### Bug Fixes

- Fixed issue with date formatting in registry table component

## 5.34.2

### Chores

- Dependabot update #260

## 5.34.1

### Changes

- Improved API route logs for fetch failures

## 5.34.0

### Changes

- Bump min version of `VisBackend Agent` from `v1.8.2` to `v1.9.0`
- Rework viz to be compatible with `v1.9.0` of the `VisBackend Agent`
- Implemented the new outstanding, scheduled and closed tasks functionality in the registry
- Added Date range filter for the scheduled and closed tasks , using react-day-picker library

## 5.33.2

### Changes

- Bump min version of `VisBackend Agent` from `v1.8.1` to `v1.8.2`

### Bug Fixes

- Fixed the issue with default values being ignored when sent from the API, especially for partial solutions
- Fixed form field arrays

## 5.33.1

### Changes

- Changed the styles of the landing page

## 5.33.0

### Changes

- Split Registry into two pages: `Registry Submissions` for previously Pending contracts and `Registry Records` for tasks
- Added toast notifications
- Fix view sizes for tablets

## 5.32.0

### Changes

- Bump min version of `VisBackend Agent` from `v1.6.1` to `v1.8.1`
- Rework viz to be compatible with `v1.8.1` of the `VisBackend Agent`
- Update decoding of settings and items in registry
- Translatable statuses are now displayed in registry

## 5.31.0

- Viz now requires no external dependency at docker container spinup / next app build time

## 5.30.5

### Changes

- Fixed issues with the UTF-8 encoding which was causing issues with some characters when translating from German to English.

## 5.30.4

### Bug Fixes

- Increased the size of the buttons in the action menu
- Fixed permissions of the action buttons

## 5.30.3

### Bug Fixes

- Fixed the layout issues on mobile and tablets
- Fixed strange hovering effects' interaction with checkbox buttons on tablets

## 5.30.2

### Bug Fixes

- Fix the missing german translations for add and view buttons

## 5.30.1

### Changes

- Users are now able to directly assign, complete, cancel, or report tasks from the table

### Bug Fixes

- Fixed broken registry requests

## 5.30.0

### Changes

- Enable users to view or update completion records even after completed
- Bump min version of `VisBackend Agent` from `v1.5.1` to `v1.6.1`
- Rework viz to be compatible with `v1.6.1` of the `VisBackend Agent`

### Bug Fixes

- Fixed the completion and dispatch record retrieval to work with arrays

## 5.29.3

### Changes

- Added an additional tag for setting general registry nav icons

### Bug Fixes

- Fixed duplicate default navigation elements
- Fixed missing icons in navigation elements

## 5.29.2

### Changes

- Update German translations

### Bug Fixes

- Fixed untranslated button texts

## 5.29.1

### Changes

- Improved configuration of dashboard

## 5.29.0

### Changes

- New Registry redesign

### Bug Fixes

- Fixed optional configuration file setup

## 5.28.3

### Chores

- Bump node version in dockerfile to 24.2

## 5.28.2

### Chores

- Dependabot _security_ update #218

## 5.28.1

### Chores

- Dependabot update #220

### Changes

- Beginning of major data fetching overhaul, starting with registry data. External API calls are now proxied through `next.js` via custom API routes as specified in [the guides](https://nextjs.org/docs/pages/building-your-application/routing/api-routes). Future versions will replace Scenario API endpoints as well as the geoserver proxy and other external calls.

### Improvements

- The above design pattern significantly bolsters security of the viz app against SSRF and potential DDOS vulnerability.

## 5.27.5

### Changes

- Made the left navigation menu available on all pages
- Made the left navigation menu collapsable
- Changed the icons in the navigation menus

## 5.27.4

### Changes

- Implemented Mobile Menu Navigation
- Updated the landing page design

### Bug Fixes

- Fix the enable and disable of the help page in ui-settings

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
