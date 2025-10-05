FROM golang:1.25-alpine

WORKDIR /app

COPY . .

WORKDIR /app/transfer-service
RUN go mod download
RUN go build -o /transfer-service ./cmd

EXPOSE 8082

CMD ["/transfer-service"]