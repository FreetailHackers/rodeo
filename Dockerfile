FROM node:16

RUN apt-get update
RUN apt-get install -y postgresql-client
