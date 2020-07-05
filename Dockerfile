FROM node:10.11.0-alpine

# LABEL "com.github.actions.name"="action-update-lambda"
# LABEL "com.github.actions.description"="Github Action to Update an AWS Lambda Function and Alias"
# LABEL "com.github.actions.icon"="check-square"
# LABEL "com.github.actions.color"="orange"

# LABEL "repository"="https://github.com/grez72/action-update-lambda"
# LABEL "homepage"="https://github.com/grez72/action-update-lambda#readme"
# LABEL "maintainer"="George Alvarez <grez72@gmail.com>"

COPY ./src /action

RUN npm --prefix /action install /action

ENTRYPOINT ["/action/entrypoint.sh"]