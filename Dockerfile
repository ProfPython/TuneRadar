FROM golang:1.24-alpine

RUN apk update && apk add --no-cache sqlite sqlite-dev build-base

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod tidy

COPY . .

RUN GOOS=linux GOARCH=amd64 go build -o main .

EXPOSE 3000

CMD ["go run *.go serve"]