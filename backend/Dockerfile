# use an official Node.js runtime as a parent image
FROM node:22-alpine

# set working directory
WORKDIR /app

# copy package.json and package-lock.json
COPY package*.json ./

# install dependencies
RUN npm install

# copy the rest of the application code
COPY . .

# generate Prisma client
RUN npx prisma generate

# expose the port the app runs on
EXPOSE 5003

# start the application
CMD ["node", "src/server.js"]