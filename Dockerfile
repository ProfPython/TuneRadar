FROM node:18 AS frontend-build

WORKDIR /app/client

COPY client/package.json client/package-lock.json ./
RUN npm install

RUN npm run build

FROM golang:1.24-alpine AS backend-build

RUN apk update && apk add --no-cache sqlite sqlite-dev build-base

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod tidy

COPY . .

RUN GOOS=linux GOARCH=amd64 go build -o main .

FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /app

COPY --from=frontend-build /app/client/build /app/client/build
COPY --from=backend-build /app/main /app/

EXPOSE 3000

CMD ["/bin/sh", "-c", "cd /app/client && serve -s build & cd /app && ./main"]