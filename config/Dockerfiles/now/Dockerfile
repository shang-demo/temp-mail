FROM node:8.9
ARG DEBIAN_FRONTEND=noninteractive

WORKDIR /app

# cache npm install
COPY package.json /app
RUN npm install && npm i -g pm2

# copy project
ADD . /app

EXPOSE 3000

CMD ["npm", "run", "start"]
