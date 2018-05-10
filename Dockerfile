FROM node:8

RUN mkdir -p /src/app

WORKDIR /src
COPY package.json yarn.lock ./
RUN yarn

WORKDIR /src/app
COPY . /src/app
