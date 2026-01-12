# Authorisation Server Config

This authorisation stack contains Keycloak for role and access management to an application, a redis store for fast in memory session management of your web app, and a database to store the Keycloak data (now including sessions for persistent user sessions through redeployment).

There are two types of server deployments stored in separate files -  a development and production server with sensible config as tested within the TWA framework. In general, the dev server should be used first to test client interaction, and to set up configuration settings in the keycloak UI to be exported and used to set the production server. The purpose of the compose files are to take care of most of this, however you will need to specify the location of the auth server. Refer to the [keycloak guides](https://www.keycloak.org/guides) for detailed guidance on server administration and securing apps.

- Before deployment, create a .env file in this directory and specify the admin usernames and passwords following the compose file. Common variables for both servers:
  - `KEYCLOAK_BOOTSTRAP_ADMIN` default is set to `admin`
  - `KEYCLOAK_BOOTSTRAP_ADMIN_PASSWORD`, default is `theworldavatar`

> [!NOTE]  
> Since Keycloak 26.0 these have changed, and will be prompted to change in the UI after spinning up. 
> This dispenses with the need to have sensitive admin login stored as an environment variable.

The development server is stored in the `compose.dev.yml` file and can be deployed using `docker compose -f './compose.dev.yml' up -d` in this directory.

The production server is stored in the `compose.yml` file and can be deployed using `docker compose up -d` in this directory. This server requires some extra configuration of TLS, database integration, session store management, hosting (nginx or relevant proxy management). Read sections [2](#2-database), [3](#3-pgadmin), and [4](#4-redis) for the additional details.

- Note that the production build will also require the following additional variables:
  - `POSTGRES_PASSWORD`, default `theworldavatar`
  - `PGADMIN_LOGIN_EMAIL` default: `user@example.com`
  - **N.B** you can also create a `postgres-password` file in this directory, uncomment the POSTGRES_PASSWORD_FILE line in the `compose` file and set the postgres password via a docker secret, but this is probably pointless since Keycloak does not support docker secrets so must be passed in as an environment variable anyway. This will be updated if keycloak adds secret support.

## Table of Contents

- [Authorisation Server Config](#authorisation-server-config)
  - [Table of Contents](#table-of-contents)
  - [1. Keycloak container](#1-keycloak-container)
  - [2. Database](#2-database)
  - [3. PGAdmin](#3-pgadmin)
  - [4. Redis](#4-redis)
  - [5. Roles](#5-roles)
 
## 1. Keycloak container

This directory contains the needed info to spin up a *dev config* and a sample *prod config* for Keycloak authorisation of a viz app. This is not suitable for production deployment, instead a production Keycloak server should be used.
There is a sample realm imported by this project called 'twa-test'. 
It can be used to test securing of applications, or you may create your own realm in the UI and export it for the prod server. 
Do not commit exported realms anywhere.

- First, enable Keycloak authorisation by setting the KEYCLOAK environment variable to true in your viz-app's docker compose file or `twa-vis-platform/code/[.env|.env.local]`  (if running a local node server in development).s
- This is a Keycloak dev container. This is *not* suitable for production but is useful for testing the authentication flow of your web app and to create realm settings to be later exported.
- The Keycloak admin console will be running at `http://localhost:8081`.
- There is a `twa-test` sample realm in this directory that is imported on startup. Use the keycloak UI to create a your own one specific to your use case. This can be later exporteed and imported for the production deployment.
- Users must be created manually. Set a name and password. Assigning a user a `protected` role will allow them to access the role-protected pages.
- Ensure that the `keycloak.json` file correctly points to the address of the auth server. This can be `localhost` if running a node server on the bare metal but should be a host that is valid from within the web container. This can be `host.docker.internal` (docker's alias for your host machine) the direct hostname or its IPv4 address
  - **NB** `hosts.docker.internal` only exists in your machine's `hosts` file if docker is installed. If this name does not resolve, you probably need to specify `localhost` or another IP
- The Keycloak UI also needs to know where the web app is running. This is specified in the UI of the Keycloak admin console when you click on clients > job-portal. This is set to `http://localhost:3000` by default but should be changed if your app is running somewhere else.

## 2. Database

The compose file is correctly configured to spin up a postgres database inside the docker network. Keycloak will access it via its url at `jdbc:postgresql://postgres/keycloak`.

This should not require any further configuration.

## 3. PGAdmin

The PGAdmin container is optional and can be excluded as it is mainly intended for debug purposes. Uncomment if you require this.
You can use it to check if realms and users are being correctly stored in postgres. 
You will need to add your postgres server using the host `postgres` (visible inside the docker network), and database 'keycloak'.

You can also connect to this via adminer if you prefer, by starting an adminer container and connecting to the database on port `5432` which is forwarded to the server host by default (`localhost:5432`). 
This assumes you do not have another database forwarding to localhost.

## 4. Redis

The store is in place to store and cache user sessions specific to the viz. Users can choose to deploy the redis as a separate container or as part of the stack (see `./stack/redis.json` for a custom stack service). 

### 4.1 Standalone container

1. Uncomment the redis service and volume in the `compose.yml`
2. Change the password in redis.conf
3. Start the compose project
4. If successful, the redis container will run at port `6379`

### 4.2 Stack deployment

1. Put the `./stack/redis.json` into the custom service directory of your stack-manager directory
2. Add a password secret to the stack called `redis_password`
3. Start the stack as per usual

## 5. Roles

The sample `realm.json` includes predefined client roles (in the `viz` client), which are mandatory for the `viz` platform to function correctly. These core roles must be present in any custom configuration. To support other backend services, it is recommended to leverage the predefined core roles. But if they are unsuitable for your application, users can define and incorporate additional custom roles. Below is a list of these core roles:

1) admin: Grants unrestricted access to all features and functionalities.
2) sales: Provides access to sales-related functionalities.
3) finance: Provides access to finance-related functionalities.
4) operations: Provides access to operation-related functionalities.
5) task-viewer: Permits users to view, report on, and complete tasks only.