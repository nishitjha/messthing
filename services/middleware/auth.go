package middleware

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/clerk/clerk-sdk-go/v2/jwt"
	"github.com/gin-gonic/gin"
)

type LeewayClock struct {
	Leeway time.Duration
}

func (c LeewayClock) Now() time.Time {
	return time.Now().Add(c.Leeway)
}

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

		leewayClock := LeewayClock{Leeway: 5 * time.Second}

		claims, err := jwt.Verify(context.Request.Context(), &jwt.VerifyParams{
			Token: token,
			Clock: leewayClock,
		})

		if err != nil {
			fmt.Printf("failed to verify token: %v\n", err)
			context.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			context.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		context.Set("userID", claims.Subject)
		context.Next()
	}
}
