FROM node:18.16.0-buster

RUN [ "npm", "install", "--location=global", "nx"]