ARG TAG=16
FROM node:${TAG}

ARG APP_DIR=/app

WORKDIR ${APP_DIR}

ADD main.js .
ADD time.yaml .
ADD package.json .
ADD package-lock.json .
ADD static static
ADD views views

RUN npm ci

ENV PORT=3000

EXPOSE ${PORT}

ENTRYPOINT [ "node", "main" ]
