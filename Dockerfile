# For some incomprehensible reason, the seed script only works on Node 16.
FROM node:20

RUN apt-get update
RUN apt-get install -y postgresql-client
