FROM golang:1.25-alpine

WORKDIR /app

COPY . .

WORKDIR /app/accounts-service
RUN go mod download
RUN go build -o /accounts-service ./cmd

EXPOSE 8081

CMD ["/accounts-service"]