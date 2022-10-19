FROM node:18-alpine
# docker build . --tag danger -f Dockerfile --progress tty

# create dir
# RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
# WORKDIR /home/node/app

ARG BUILD_VERSION
ENV VERSION=$BUILD_VERSION

WORKDIR /danger

RUN apk -v add jq

ENV WORK_DIR "/danger"
ENV IS_CI "true"

COPY . ./

RUN ["rm", "-rf", "./node_modules"]
RUN ["rm", "dangerfile.js"]
RUN ["yarn"]

COPY ./entrypoint.sh /usr/local/bin/code-review
RUN chmod +x /usr/local/bin/code-review

ENV DANGER_GITLAB_HOST "https://gitlab.com"
ENV PATH /danger/node_modules/bin:$PATH

ENTRYPOINT [ "/bin/sh", "-c" ]
CMD ["sh"]
