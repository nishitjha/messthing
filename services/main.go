package main

import (
	"fmt"

	"github.com/gin-contrib/cors"
	"github.com/nishitjha/messthing/services/router"
)

func main() {
	deps := &router.Deps{}

	router := router.NewRouter(deps)
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:8081", "http://172.17.35.19:8081"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	fmt.Println("Listening on port 8080...")
	if err := router.Run(":8080"); err != nil {
		fmt.Println("Error starting server:", err)
	}
}
