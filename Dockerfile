FROM node:20.15.0-slim

RUN apt-get update -y && apt-get upgrade -y

WORKDIR /home/node/app

# update npm
RUN npm install -g npm

# create cache
COPY package*.json ./
RUN npm ci

USER node

CMD [ "tail", "-f", "/dev/null" ]
