FROM node:20-alpine
# docker build . --tag danger -f Dockerfile --progress tty
# docker run --rm -it danger /bin/bash

# RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
# WORKDIR /home/node/app

ARG BUILD_VERSION
ENV VERSION=$BUILD_VERSION

WORKDIR /danger
# hadolint ignore=DL3018
RUN apk -v add --no-cache jq util-linux bash

ENV WORK_DIR "/danger"
ENV IS_CI "true"

COPY . ./

RUN yarn

COPY ./entrypoint.sh /usr/local/bin/code-review
RUN chmod +x /usr/local/bin/code-review

ARG BUILD_VERSION
ENV BUILD_VERSION=$BUILD_VERSION

ARG BETA_VERSION
ENV BETA_VERSION=$BETA_VERSION

ENV DANGER_GITLAB_HOST "https://gitlab.com"
ENV PATH /danger/node_modules/bin:$PATH

ENTRYPOINT [ "/bin/bash", "-c" ]
# CMD ["sh"]
