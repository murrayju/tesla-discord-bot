FROM node:14 as builder

ENV buildDir /opt/build
RUN mkdir -p ${buildDir}
WORKDIR ${buildDir}

# Install node dependencies
COPY ["yarn.lock", "package.json", "tsconfig.json", "${buildDir}/"]
RUN yarn

# Build the code
ARG BUILD_NUMBER
ENV BUILD_NUMBER ${BUILD_NUMBER:-0}
COPY [".", "${buildDir}/"]
RUN yarn run run tsc

# Defaults when running this container
ENTRYPOINT ["yarn", "run", "run"]
CMD ["dev"]

###
# Production image. Only include what is needed for production
###
FROM node:14 as production

ENV appDir /opt/app
RUN mkdir -p ${appDir}
WORKDIR ${appDir}

ENV NODE_ENV production
# Install (production) node dependencies
COPY ["yarn.lock", "package.json", "${appDir}/"]
RUN yarn

COPY --from=builder ["/opt/build/config", "${appDir}/config"]
COPY --from=builder ["/opt/build/dist/src", "${appDir}/"]

RUN mkdir /config
RUN mkdir /data

CMD ["node", "./index.js", "--merge-config"]
