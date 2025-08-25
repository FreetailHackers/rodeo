FROM node:20

RUN apt-get update
RUN apt-get install -y postgresql-client
