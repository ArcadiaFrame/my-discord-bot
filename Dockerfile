# Use an official Node.js v18 image from Docker Hub.
# This provides a consistent environment with Node.js and npm pre-installed.
FROM node:18

# Set the working directory inside the container to /usr/src/app.
# All subsequent commands (like COPY, RUN) will happen in this folder.
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files first.
# Docker caches layers, so it won't re-install dependencies unless these files change.
COPY package*.json ./

# Install the project's dependencies defined in package.json (discord.js, node-fetch).
RUN npm install

# Copy the rest of your bot's source code (the 'src' folder) into the container.
COPY ./src .

# The command that will be executed when the container starts.
# This runs your bot using Node.js.
CMD ["node", "bot.js"]