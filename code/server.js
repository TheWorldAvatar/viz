/**
 * Custom Server for Next.js Application
 *
 * Overview:
 * This server script enhances the Next.js application by enabling custom server functionality.
 * It primarily adds support for serving static files from a directory that's specified at deploy time,
 * facilitating the use of Docker volumes or similar deployment strategies.
 *
 * server side session storage (cookies) for keycloak authentication are configured here
 * 
 * Note:
 * Next.js, by default, serves static files from the 'public' directory, which requires contents to be present at build time.
 * This script extends that capability to allow serving files from a different directory after the build process.
 */

import express from "express";
import next from "next";

import session, { MemoryStore } from 'express-session';
import { createClient } from "redis"
import { RedisStore } from 'connect-redis';
import Keycloak from 'keycloak-connect';

const colourReset = "\x1b[0m";
const colourRed = "\x1b[31m";
const colourGreen = "\x1b[32m";
const colourYellow = "\x1b[33m";


// Configure the server port; default to 3000 if not specified in environment variables
if (process.env.PORT) { console.info('port specified in environment variable: ', colourGreen, process.env.PORT, colourReset); }
const port = process.env.PORT || 3000;
const keycloakEnabled = process.env.KEYCLOAK === 'true';
const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || 6379;

if (process.env.ASSET_PREFIX) { console.info('Resource and Asset Prefix: ', colourGreen, process.env.ASSET_PREFIX, colourReset); }

console.info('keycloak authorisation required: ', keycloakEnabled ? colourYellow : colourGreen, process.env.KEYCLOAK, colourReset)

// Determine the deployment mode based on NODE_ENV; default to 'development' mode if not specified
const dev = process.env.NODE_ENV !== "production";

// Initialise the Next.js application
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();
let store;

// Prepare the Next.js application and then start the Express server
nextApp.prepare().then(() => {
    const expressServer = express();

    if (keycloakEnabled) { // do keycloak auth stuff if env var is set
        if (process.env.PROTECTED_PAGES) console.info('the following pages require keycloak authentication', colourYellow, process.env.PROTECTED_PAGES, colourReset);
        if (process.env.ROLE && process.env.ROLE_PROTECTED_PAGES) console.info('the following pages require the', process.env.ROLE ? colourYellow : colourRed, process.env.ROLE, colourReset, 'role: ', process.env.ROLE_PROTECTED_PAGES ? colourYellow : colourRed, process.env.ROLE_PROTECTED_PAGES, colourReset)
        else console.info('No pages protected with role');

        expressServer.set('trust proxy', true); // the client’s IP address is understood as the left-most entry in the X-Forwarded-For header.

        if (!dev) {
            let redisClient;
            console.info(`development mode is:`, colourGreen, dev, colourReset, `-> connecting to redis session store at`, colourGreen, `${redisHost}:${redisPort}`, colourReset);
            try {
                redisClient = createClient({
                    socket: {
                        host: redisHost,
                        port: redisPort
                    }
                });
            } catch (error) {
                console.info('Error while creating Redis Client, please ensure that Redis is running and the host is specified as an environment variable if this viz app is in a Docker container');
                console.error(error);
            }
            redisClient.connect().catch('Error while creating Redis Client, please ensure that Redis is running and the host is specified as an environment variable if this viz app is in a Docker container', console.error);
            store = new RedisStore({
                client: redisClient,
                prefix: "redis",
                ttl: undefined,
            });
        } else {
            store = new MemoryStore(); // use in-memory store for session data in dev mode
            console.info(`development mode is:`, dev ? colourYellow : colourRed, dev, colourReset, `-> using in-memory session store (express-session MemoryStore())`);
        }

        expressServer.use(
            session({
                secret: 'login',
                resave: false,
                saveUninitialized: true,
                store: store,
            })
        );

        const keycloak = new Keycloak({ store: store });
        expressServer.use(keycloak.middleware());

        expressServer.get('/api/userinfo', keycloak.protect(), (req, res) => {
            // preferred_username; given_name; family_name; name; realm_access: { roles }; resource_access: clientRoles
            const { name, resource_access } = req.kauth.grant.access_token.content;
            const roles = resource_access?.viz?.roles || [];
            res.json({ name, roles });
        });

        if (!process.env.PROTECTED_PAGES) {
            console.info('No protected pages specified. Protecting', colourGreen, 'all', colourReset, 'pages with Keycloak authentication.');
            expressServer.get("*allpaths", keycloak.protect());
        } else {
            const protectedPages = process.env.PROTECTED_PAGES.split(',');
            protectedPages.forEach(page => {
                expressServer.get(page, keycloak.protect());
            });
        }
        if (process.env.ROLE_PROTECTED_PAGES) {
            if (process.env.ROLE) {
                const roleProtectedPages = process.env.ROLE_PROTECTED_PAGES?.split(',');
                roleProtectedPages?.forEach(page => {
                    expressServer.get(page, keycloak.protect(process.env.ROLE));
                    console.info('protecting page', page, 'with role', process.env.ROLE);
                });
            } else {
                console.info(colourRed, 'ROLE_PROTECTED_PAGES specified but no ROLE specified. No pages will be protected with role', colourReset);
            }
        }

        const useGeoServerProxy = process.env.REACT_APP_USE_GEOSERVER_PROXY === 'true';
        console.info('Geoserver proxying is', useGeoServerProxy ? colourYellow : colourGreen, useGeoServerProxy, colourReset);

        // Remove legacy GeoServer proxy route, as this is now handled by Next.js API route
        if (useGeoServerProxy) {
            console.info('GeoServer requests from MapBox will be sent to ', colourYellow, '<client-window-location>/api/geoserver-proxy', colourReset, '(the app base URL)');
        }
    }

    // Handle all other requests using Next.js
    expressServer.all("*allpaths", (req, res) => {
        if (req.kauth?.grant) {
            req.headers['x-bearer-token'] = req.kauth.grant.access_token.token; // Pass the token from express server to next.js, to be available in getServerSideProps calls
        }
        return handle(req, res);
    });

    // Start listening on the specified port and log server status
    expressServer.listen(port, (err) => {
        if (err) throw err;
        console.info('Running at', colourGreen, `http://localhost:${port}${colourReset}`, `(on host / inside container). Development mode :${dev ? colourYellow : colourGreen}`, dev, colourReset);
    });
});