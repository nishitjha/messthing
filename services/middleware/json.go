package middleware

import (
	"bytes"
	"encoding/json"
	"io"

	"github.com/gin-gonic/gin"
)

func ParseJSON() gin.HandlerFunc {
	return func(context *gin.Context) {

		bodyBytes, _ := io.ReadAll(context.Request.Body)

		context.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))

		var parsed map[string]interface{}

		if len(bodyBytes) > 0 {
			json.Unmarshal(bodyBytes, &parsed)
		}

		context.Set("jsonBody", parsed)
		context.Next()
	}
}
