FROM node:8

# npm install
ADD package.json /tmp/package.json


RUN cd /tmp && npm install


RUN mkdir -p /opt/app-root && cp -a /tmp/node_modules /opt/app-root/

WORKDIR /opt/app-root/
COPY . .

EXPOSE 3100

CMD ["npm", "run", "start"]
