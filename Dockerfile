FROM node:18-alpine
# docker build . --tag danger -f Dockerfile --progress tty

# create dir
# RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
# WORKDIR /home/node/app

WORKDIR /home/node/app

COPY . ./
# USER node
RUN ["rm", "-rf", "./node_modules"]
RUN ["yarn"]

ENTRYPOINT [ "/bin/sh", "-c" ]
CMD ["sh"]
