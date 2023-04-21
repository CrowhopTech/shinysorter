FROM docker.io/node:lts-alpine

WORKDIR /app

RUN apk add attr

RUN addgroup --system backuptool && \
    adduser --system -G backuptool backuptool

COPY dist/apps/backuptool dist
COPY apps/backuptool/backup.sh .
COPY apps/backuptool/restore.sh .
RUN chown -R backuptool:backuptool .

CMD [ "node", "dist" ]