FROM node

MAINTAINER Rodaan Peralta-Rabang "rodaan.rabang@gmail.com"

WORKDIR /artifacts

COPY package.json /artifacts/
RUN npm install -g yarn; yarn install
COPY . /artifacts

EXPOSE 3000

CMD node index.js