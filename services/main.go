package main

import (
	"fmt"

	"github.com/gin-gonic/gin"
)

type JSONresponse struct {
	Message   string
	RequestID string `json:",omitempty"`
}

func Listen() error {
	gin.SetMode(gin.ReleaseMode)
	router := gin.Default()

	router.GET("/", func(c *gin.Context) {
		c.JSON(200, JSONresponse{Message: "hey"})
	})

	fmt.Println("Listening on port 8080...")

	err := router.Run(":8080")
	return err
}

func main() {
	err := Listen()
	if err != nil {
		fmt.Println("Error starting server:", err)
	}

}
