FROM golang:1.25-alpine

WORKDIR /app

# Копируем зависимости
COPY go.mod ./
COPY go.sum ./
RUN go mod download

# Копируем исходный код
COPY . .

# Сборка
RUN go build -o /transfer-service ./cmd

EXPOSE 8082

CMD ["/transfer-service"]