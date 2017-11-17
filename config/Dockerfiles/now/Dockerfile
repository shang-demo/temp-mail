FROM node:8.9
ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update -qqy \
  && apt-get -qqy install \
       wget ca-certificates apt-transport-https \
       ttf-wqy-zenhei ttf-unfonts-core \
  && rm -rf /var/lib/apt/lists/* /var/cache/apt/*

RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && echo "deb https://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list \
  && apt-get update -qqy \
  && apt-get -qqy install google-chrome-unstable \
  && rm /etc/apt/sources.list.d/google-chrome.list \
  && rm -rf /var/lib/apt/lists/* /var/cache/apt/*

# chrome tmpdir
RUN mkdir /data

WORKDIR /app

# cache npm install
COPY package.json /app
RUN npm install

# copy project
ADD . /app

EXPOSE 3000

CMD ["npm", "run", "start"]
