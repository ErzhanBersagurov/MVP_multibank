FROM golang:1.25-alpine

WORKDIR /app

# Копируем ВЕСЬ проект
COPY . .

# Переходим в папку auth-service и собираем
WORKDIR /app/auth-service
RUN go mod download
RUN go build -o /auth-service ./cmd

EXPOSE 8080

CMD ["/auth-service"]