#
# This Dockerfile copies in the node project's source, and sets the 
# Docker starting command to run when the container launches. 
#
# Note that it does not actually build the project until the container
# is actually executed. This is because Next.js performs its Static
# Site Generation (server-side rendering) at build time; building
# during the Image build process would mean that no data in any mounted
# volumes could be used, so instead we build when the container launches,
# so that volumed data can be used.
#

# ---- Base Image ----
FROM node:25.1-slim AS base
RUN corepack enable
WORKDIR /twa
RUN mkdir .public_hash
ENV NEXT_TELEMETRY_DISABLED 1
COPY ./code/package.json  ./

# ---- Production Image ----
FROM base AS production
COPY ./code/pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile
COPY ./code ./
COPY check-build-start.sh /twa/check-build-start.sh
RUN chmod +x /twa/check-build-start.sh
EXPOSE 3000
ENV HOSTNAME "0.0.0.0"
CMD [ "/twa/check-build-start.sh" ]