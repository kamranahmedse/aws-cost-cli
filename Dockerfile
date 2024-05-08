# Use Node.js image as base
FROM node:latest

# Install aws-cli globally using npm
RUN npm install -g aws-cost-cli

# Set the entrypoint to aws-cost-cli
ENTRYPOINT ["aws-cost"]

