FROM node:8 as build-stage
COPY ./tech /root/.ssh/id_rsa
RUN chmod 600 /root/.ssh/id_rsa
RUN ssh-keyscan -t rsa gitlab.com > ~/.ssh/known_hosts
RUN apt-get update && apt-get install git
RUN npm i npm@latest -g
WORKDIR /workspace
COPY package*.json /workspace/
RUN npm install
COPY ./ /workspace/
RUN npm run build; exit 0
