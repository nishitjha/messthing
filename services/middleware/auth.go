package middleware

import (
	"net/http"
	"strings"

	"github.com/clerk/clerk-sdk-go/v2/jwt"
	"github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(context *gin.Context) {
		authHeader := context.GetHeader("Authorization")
		token := strings.TrimPrefix(authHeader, "Bearer ")
		if token == "" {
			context.JSON(http.StatusUnauthorized, gin.H{"error": "missing token"})
			return
		}

		claims, err := jwt.Verify(context.Request.Context(), &jwt.VerifyParams{
			Token: token,
		})
		if err != nil {
			context.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}

		context.Set("userID", claims.Subject)
		context.Next()
	}
}
