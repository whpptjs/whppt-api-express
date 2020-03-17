FROM node:12.16.1-alpine

ENV MONGO_URL="mongodb://0.0.0.0:27017"
ENV MONGO_DB="whppt_development"

# create destination directory
RUN mkdir -p /usr/src/app
COPY . /usr/src/app/

WORKDIR /usr/src/app
RUN npm install

WORKDIR /usr/src/app/example
RUN npm install

EXPOSE 3001

# start the app
ENTRYPOINT ["npm", "start"]
