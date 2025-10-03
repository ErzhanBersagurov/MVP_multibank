package handlers

import (
    "net/http"
    "time"
    "os"
    
    "github.com/gin-gonic/gin"
    "github.com/golang-jwt/jwt/v5"
    "golang.org/x/crypto/bcrypt"
    
    "github.com/ErzhanBersagurov/MVP_multibank/auth-service/models"
    "github.com/ErzhanBersagurov/MVP_multibank/auth-service/storage"
)

type AuthHandler struct {
    userStorage *storage.UserStorage  // ВЕРНУТЬ указатель *
}

func NewAuthHandler(userStorage *storage.UserStorage) *AuthHandler {  // ВЕРНУТЬ указатель *
    return &AuthHandler{userStorage: userStorage}
}

// CORS middleware и остальной код БЕЗ ИЗМЕНЕНИЙ
func (h *AuthHandler) StartServer(port string) error {
    r := gin.Default()
    
    // CORS middleware - ОСТАВИТЬ!
    r.Use(func(c *gin.Context) {
        c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
        c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
        
        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(204)
            return
        }
        
        c.Next()
    })
    
    r.POST("/register", h.Register)
    r.POST("/login", h.Login)
    r.POST("/validate", h.ValidateToken)
    r.GET("/health", h.HealthCheck)
    
    return r.Run(":" + port)
}

// Все остальные методы БЕЗ ИЗМЕНЕНИЙ
func (h *AuthHandler) Register(c *gin.Context) {
    var user models.User
    if err := c.ShouldBindJSON(&user); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    if err := h.userStorage.CreateUser(&user); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "User creation failed"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "message": "User created successfully", 
        "user_id": user.ID,
    })
}

func (h *AuthHandler) Login(c *gin.Context) {
    var loginReq models.LoginRequest
    if err := c.ShouldBindJSON(&loginReq); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    user, err := h.userStorage.FindUserByUsername(loginReq.Username)
    if err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
        return
    }

    if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(loginReq.Password)); err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
        return
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
        "user_id": user.ID,
        "exp":     time.Now().Add(time.Hour * 24).Unix(),
    })

    jwtSecret := os.Getenv("JWT_SECRET")
    if jwtSecret == "" {
        jwtSecret = "simple-secret-12345"
    }
    tokenString, err := token.SignedString([]byte(jwtSecret))

    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Token generation failed"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "token": tokenString,
        "user_id": user.ID,
    })
}

func (h *AuthHandler) ValidateToken(c *gin.Context) {
    c.JSON(http.StatusOK, gin.H{"valid": true})
}

func (h *AuthHandler) HealthCheck(c *gin.Context) {
    c.JSON(http.StatusOK, gin.H{"status": "OK", "service": "auth-service"})
}