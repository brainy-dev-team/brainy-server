FROM node

MAINTAINER Rodaan Peralta-Rabang "rodaan.rabang@gmail.com"

WORKDIR /artifacts

COPY package.json /artifacts/
RUN npm install -g yarn; yarn install
COPY . /artifacts

RUN rm -r questions/; git clone https://github.com/brainy-dev-team/questions-repo.git questions

EXPOSE 3000

CMD node index.js