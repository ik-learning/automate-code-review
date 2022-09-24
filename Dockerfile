FROM node:18-alpine
# docker build . --tag danger -f Dockerfile --progress tty

# create dir
# RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
# WORKDIR /home/node/app

WORKDIR /danger

ENV WORK_DIR "/danger"
ENV DANGER_GITLAB_HOST "https://gitlab.com"

COPY . ./
# USER node
RUN ["rm", "-rf", "./node_modules"]
RUN ["rm", "dangerfile.js"]
RUN ["yarn"]

ENTRYPOINT [ "/bin/sh", "-c" ]
CMD ["sh"]
