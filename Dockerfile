FROM node:20.15.1-slim

RUN apt-get update -y && apt-get upgrade -y

WORKDIR /home/node/app

USER node

CMD [ "tail", "-f", "/dev/null" ]
