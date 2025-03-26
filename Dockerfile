
FROM golang:1.20 AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod tidy

COPY . .

RUN go build -o main .

FROM alpine:latest

RUN apk add --no-cache sqlite3

WORKDIR /app

COPY --from=builder /app/main .

EXPOSE 3000

CMD ["./main"]
