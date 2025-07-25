![GitHub Tag](https://img.shields.io/github/v/tag/TheWorldAvatar/viz?logo=git&logoColor=%20%23F05032&label=Version&labelColor=0B4452&color=0d5226)
![GitHub Issues or Pull Requests](https://img.shields.io/github/issues-pr-closed/TheWorldAvatar/viz?logo=refinedgithub&logoColor=%239E95B7&labelColor=d9877c&color=51b7a6)
![GitHub contributors](https://img.shields.io/github/contributors/TheWorldAvatar/viz?logo=github&logoColor=181717&color=18677a&labelColor=157b3e)
[![Docker Image CI](https://github.com/TheWorldAvatar/viz/actions/workflows/docker-ci.yml/badge.svg)](https://github.com/TheWorldAvatar/viz/actions/workflows/docker-ci.yml)




# The World Avatar (TWA) Visualisation Platform

A central framework for The World Avatar (TWA) Visualisations (the TWA Visualisation Platform, or TWA-ViP) has been created to standardise and simplify the visualisation process. The goal is that a developer does not have to worry about web design, and can set up a reasonable web visualisation displaying landing pages, descriptions, dashboards, and geospatial maps, with some basic configuration files. The platform is the next stage of the Visualisation Framework, and can be [almost deployed following the same steps](#1-precursor).

## Table of Contents

- [The World Avatar (TWA) Visualisation Platform](#the-world-avatar-twa-visualisation-platform)
  - [Table of Contents](#table-of-contents)
  - [1. Precursor](#1-precursor)
  - [2. Development](#2-development)
  - [3. Production](#3-production)
    - [3.1 Docker Deployment](#31-docker-deployment)
    - [3.2 Stack Deployment](#32-stack-deployment)
  - [4 Authorisation](#4-authorisation)
  - [5. Release](#5-release)
    - [Your Responsibilities Before Merging a Pull Request](#your-responsibilities-before-merging-a-pull-request)

## 1. Precursor

As the visualisation platform is intended to be customisable, [configuration files](./doc/config.md) must be included to customise the platform for specific user requirements. If there are any features or functionality you will like to see, please contact the CMCL team or create a new Github issue. Note that these files must be volume-mounted into the Docker container at `/twa/public/`, with specific instructions provided in the relevant deployment sections. To enable specific platform features, the following agents may need to be deployed, with detailed instructions available in their respective READMEs. The current version of the platform is only compatible with the stated versions of the agents and may not be backward-compatible.

1. [Feature Info Agent](https://github.com/TheWorldAvatar/Feature-Info-Agent): `v3.3.0`
2. [Vis Backend Agent](https://github.com/TheWorldAvatar/Viz-Backend-Agent): `v1.9.2`


If you are a developer who is adding a new feature, fixing an existing bug, or simply interested in learning more, please read the [Development](#2-development) section. If you are setting up a visualisation for your use cases, please read the [Production](#3-production) section.

For any authorisation capabilities, refer to the [Authorisation](#4-authorisation) section. When releasing the platform as a developer, be sure to review the [Releasing](#5-release) section.

Additionally, there is a tutorial in the [example](./example/) directory, including a sample directory setup. Please check it out if you are setting up the platform for the first time.

## 2. Development

Information on the source code and its architecture can be found in the [code](./code/) directory. Briefly, the TWA Visualisation Platform takes the form of a [Next.js](https://nextjs.org/) application written using [TypeScript](https://www.typescriptlang.org/), utilising both client and server-side code.

The recommended way to develop viz is to work in the `devcontainer` configured in this repo. This requires Docker installed on your machine as well as the `Dev Containers VScode` extension.

1) Simply clone this repository, then run `VSCode`'s Command Palette (`ctrl / cmd + shift + P`) and run `Dev Containers: Reopen in Container`.
2) Within the running container, create an `.env.local` file in the `./code` directory to configure app environment variables such as keycloak and mapbox integration

- `MAPBOX_USERNAME` environment variable
- `MAPBOX_API_KEY` environment variable
- `KEYCLOAK` optional environment variable to set up an authorisation server if required; See [authorisation server](#4-authorisation) for more details

3) Within the running container, set up the custom [configuration files](./doc/config.md) in the `code/public` directory. Create the `public` directory if it is not there. Sample configuration files can be found at the [example](./code/public/) directory.
4) `node_modules` should have been installed on creation of the devcontainer in a persistent pnpm store. If the installation is unsuccessful, users may interrupt the process, and run `cd ./code; pnpm install` in the terminal directly
5) Once installed, run `pnpm dev` from the `code` directory to set up the app server. Alternatively, go to the debug tab on VSCode to run in debug mode.

## 3. Production

The platform is intended to be run on Docker as part of the [TWA stack](https://github.com/cambridge-cares/TheWorldAvatar/tree/main/Deploy/stacks/dynamic/stack-manager), and other production workflows are out of the scope of this document. Developers will need to set up several [configuration files](./doc/config.md) in the a directory for bind mounting to get a minimal visualisation. Please read the [documentation](./doc/config.md) for the specific configuration syntax and directory structure. Sample [configuration files](./example/) are also available.

In order to modify the uploaded documents or configurations, the container will build the app after the container has started. Thus, users should expect to wait for a few minutes before the visualisation appears on the webpage.

### 3.1 Docker Deployment

This deployment section is for a standalone Docker container:

1. You will need a mapbox username and api token. Create files within this directory (containing the docker configurations) for `mapbox_username` and `mapbox_api_key` according to your [Mapbox](https://www.mapbox.com/) credentials. This will be passed as Docker secrets when the container is started.

To view the example configuration, simply run `docker compose up` in this directory when the mapbox secrets are created. Allow a few minutes for the viz to build and start up, you will see a message in the terminal when this is completed, as well as your docker container's status. When this has started you should see a visualisation at `http://localhost:3000` if you are running locally. For further configuration, look at the following steps.

2. (optional) Set up the custom [configuration files](./doc/config.md) in the `code/public` directory. If you wish to use other file paths, please update the `volumes` value in `docker-compose.yml` accordingly. Skip this step to use the default example config.
3. (optional) Set up the [authorisation server](#4-authorisation) and update the relevant environment variables in `docker-compose.yml` if required.
4. (optional) If the app will be running behind nginx at somewhere other than a top level domain, specify that path as an `ASSET_PREFIX` environment variable. e.g. if your app will be hosted at `subdomain.theworldavatar.io/my/viz/app`, then set `ASSET_PREFIX` to `/my/viz/app` in the docker compose file, and nginx should point directly to the `host:port` running the docker container of your app.

> [!IMPORTANT]  
> `ASSET_PREFIX` must start with a slash but not end with one, as in the example above

1. Start the container by running the command `docker compose up`. The container will be running on the host machine (whichever the command was run from) at port `3000`.

### 3.2 Stack Deployment

For deployment on the [TWA stack](https://github.com/cambridge-cares/TheWorldAvatar/tree/main/Deploy/stacks/dynamic/stack-manager), please spin up the stack with the `visualisation` service as documented [here](https://github.com/cambridge-cares/TheWorldAvatar/tree/main/Deploy/stacks/dynamic/stack-manager#example---including-a-visualisation). The key steps are as follows:

1. The `mapbox_username` and `mapbox_api_key` are available as Docker secrets
2. Copy the [custom visualisation service config](./example/vip.json) to the `stack-manager/inputs/config/services` directory
3. In the stack config file, `visualisation` is included as part of the `services` `includes` list
4. If the app will be running behind nginx at somewhere other than a top level domain, specify that path as an `ASSET_PREFIX` environment variable in the service spec file. e.g. if your app will be hosted at `subdomain.theworldavatar.io/my/viz/app`, then set `ASSET_PREFIX` to `/my/viz/app` in `visualisation.json`, and nginx should point directly to the `host:port` running the docker container of your app.

> [!IMPORTANT]  
> `ASSET_PREFIX` must start with a slash but not end with one, as in the example above.

> [!NOTE]
> For typical self-hosted TWA deployment, `ASSET_PREFIX` must contain both the top level nginx path, and the stack level nginx path. e.g. if the app is deployed in a stack at `theworldavatar.io/demos/app`, then `ASSET_PREFIX` should be set to `demos/app/visualisation` to account for the `visualisation` path added by the stack level nginx.

5. Specify the directory holding the configuration files that should be mapped to a volume called `webspace` or your preference
6. . Populate this directory with your require visualisation configuration files
7. Set up the [authorisation server](#4-authorisation) and update the relevant environment variables at `docker-compose.yml` if required.
8. Start the stack as per usual

> Custom Service

At the moment, the `visualisation` service defaults to the [Visualisation Framework](https://github.com/cambridge-cares/TheWorldAvatar/tree/main/web/twa-vis-framework). To deploy the TWA ViP, please set up a custom service. A minimal example is available in the [tutorial](./example/vip.json).

## 4 Authorisation

To secure your viz app with a Keycloak authentication server, set the relevant environment variables in the [local node environment file](.code/.env.local) or the relevant compose file in this directory. If running in a stack, the variables will be set in the service spec file. The relevant variables are:

```sh
KEYCLOAK=true|false ## whether or not to use kc authentication on the server
PROTECTED_PAGES=/page,/otherpage ## (optional) pages that a user must be logged in to see
ROLE_PROTECTED_PAGES=/role,/protected,/pages ## (optional) pages that require a user to have a given REALM or CLIENT role
ROLE=viz:protected ## the role required for the above list
```

alternatively, in the docker `docker-compose.yml` or `docker-compose.dev.yml`

```yml
KEYCLOAK: true|false ## whether or not to use kc authentication on the server
PROTECTED_PAGES: /page,/otherpage ## (optional) pages that a user must be logged in to see
ROLE_PROTECTED_PAGES: /role,/protected,/pages ## (optional) pages that require a user to have a given REALM or CLIENT role
ROLE: viz:protected ## (optional) the role required for the above list
```
If `PROTECTED_PAGES` is not defined, all pages will be protected.

The [`keycloak.json` file](./code/keycloak.json) must also be correctly configured with the realm name, its address, and the client used for this app. By default, it is configured for the sample auth server committed in [auth](/auth/), but it should be edited if another auth server is in use.

> [!NOTE]  
> Crucial information necessary for users to succeed. The most important thing is that the Keycloak server IP address is routable from inside the viz docker container, and outside. The safest way to do this is to specify the IP directly. Sometimes `host.docker.internal` works, but it is often not set in the DNS hosts file of the host machine.

> [!NOTE]
> Client roles work better for API-protecting resources than the realm roles. As in the example above, use a role like `<client>:<role>`. See the [documentation in the auth folder](./auth/README.md) to spin up a dev Keycloak server for testing.

> [!IMPORTANT]
> Access to certain platform features is controlled by predefined client roles set in the sample server configuration at `./auth/realm/realm.json`. While users can create a customised Keycloak server, please ensure that these roles are also included and assigned to users in order for the platform to perform as expected.

## 5. Release

Github Actions has been configured to automatically compile, build, and release the platform when the pull request has been merged.

### Your Responsibilities Before Merging a Pull Request

Users **MUST** perform the following actions **BEFORE** merging your approved pull request:

- Update the `CHANGELOG.md` file
  - Follow the existing format to maintain consistency
- Update the `VERSION` file
  - Refer to the [Wiki](https://github.com/cambridge-cares/TheWorldAvatar/wiki/Versioning) for the versioning format

> [!IMPORTANT]  
> Please ensure your pull request has received the required approvals before merging. Once a pull request is merged, the release process is fully automated. No further manual intervention is required. A release email will also be sent based on the `CHANGELOG.md` file.
