FROM node:19

RUN apt-get update
RUN apt-get install -y postgresql-client
