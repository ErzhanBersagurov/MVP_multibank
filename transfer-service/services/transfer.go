package services

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
    "sync"
    "time"

    "github.com/ErzhanBersagurov/MVP_multibank/transfer-service/models"
)

type TransferService struct {
    transactions []models.Transaction
    mutex        sync.Mutex
}

func NewTransferService() *TransferService {
    return &TransferService{
        transactions: []models.Transaction{},
    }
}

func (s *TransferService) InternalTransfer(userID int, req models.TransferRequest, authToken string) (*models.Transaction, error) {
    s.mutex.Lock()
    defer s.mutex.Unlock()

    // Обновляем балансы в accounts-service
    err := s.updateAccountBalances(req.FromAccount, req.ToAccount, req.Amount, authToken)
    if err != nil {
        return nil, fmt.Errorf("failed to update balances: %v", err)
    }

    transaction := models.Transaction{
        ID:          generateTransactionID(),
        FromAccount: req.FromAccount,
        ToAccount:   req.ToAccount,
        Amount:      req.Amount,
        Currency:    req.Currency,
        Status:      "completed",
        CreatedAt:   time.Now(),
    }

    s.transactions = append(s.transactions, transaction)
    return &transaction, nil
}

// updateAccountBalances обновляет балансы счетов через accounts-service
func (s *TransferService) updateAccountBalances(fromAccount, toAccount string, amount float64, authToken string) error {
    updateReq := map[string]interface{}{
        "from_account": fromAccount,
        "to_account":   toAccount,
        "amount":       amount,
    }

    jsonData, err := json.Marshal(updateReq)
    if err != nil {
        return err
    }

    // Создаем HTTP клиент и запрос с авторизационным заголовком
    client := &http.Client{}
    // 🔥 ИСПРАВЛЕНИЕ: заменили localhost на accounts-service
    req, err := http.NewRequest("POST", "https://multibank-accounts.onrender.com/balance/update", bytes.NewBuffer(jsonData))
    if err != nil {
        return err
    }

    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("Authorization", authToken)

    resp, err := client.Do(req)
    if err != nil {
        return err
    }
    defer resp.Body.Close()

    if resp.StatusCode != http.StatusOK {
        return fmt.Errorf("accounts-service returned status %d", resp.StatusCode)
    }

    return nil
}

func (s *TransferService) GetTransactionHistory(userID int) []models.Transaction {
    s.mutex.Lock()
    defer s.mutex.Unlock()
    return s.transactions
}

func generateTransactionID() string {
    return fmt.Sprintf("trx_%d", time.Now().Unix())
}