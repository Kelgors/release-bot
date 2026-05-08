FROM node:24-alpine AS base

FROM base AS build
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
ARG PACKAGE_NAME
RUN pnpm exec turbo build --concurrency=2 --filter=${PACKAGE_NAME}
RUN sed -i 's#"main": "src/index.ts"#"main": "dist/index.js"#' packages/*/package.json
RUN pnpm deploy --filter=${PACKAGE_NAME} --prod /app

FROM base AS release
COPY --from=build /app /app
WORKDIR /app
USER node
CMD [ "node", "dist/index.js" ]
