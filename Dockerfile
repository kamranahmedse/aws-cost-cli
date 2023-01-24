FROM node:18-alpine

RUN npm install -g aws-cost-cli

ENTRYPOINT ["/usr/local/bin/aws-cost"]
CMD ["--help"]
