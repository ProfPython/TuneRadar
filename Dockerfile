FROM node:16 AS frontend

WORKDIR /app/client

COPY client/package.json client/package-lock.json ./
RUN npm install

COPY client ./
RUN npm run build

FROM golang:1.24-alpine

RUN apk update && apk add --no-cache sqlite sqlite-dev build-base

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod tidy

COPY . .

COPY --from=frontend /app/client/build /app/public

RUN GOOS=linux GOARCH=amd64 go build -o main .

ENV PORT=3000
ENV HOST=0.0.0.0

EXPOSE 3000

CMD ["./main", "serve", "--host=0.0.0.0", "--port=3000"]