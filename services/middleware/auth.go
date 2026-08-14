package middleware

import (
	"net/http"
	"strings"

	"github.com/clerk/clerk-sdk-go/v2/jwt"
	"github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(context *gin.Context) {
		if context.Request.Method == "OPTIONS" {
			context.AbortWithStatus(http.StatusOK)
			return
		}

		authHeader := context.GetHeader("Authorization")
		token := strings.TrimPrefix(authHeader, "Bearer ")

		if token == "" {
			if cookie, err := context.Cookie("__session"); err == nil {
				token = cookie
			}
		}

		if token == "" {
			context.JSON(http.StatusUnauthorized, gin.H{"error": "missing token"})
			context.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		claims, err := jwt.Verify(context.Request.Context(), &jwt.VerifyParams{
			Token: token,
		})

		if err != nil {
			context.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			context.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		context.Set("userID", claims.Subject)
		context.Next()
	}
}
