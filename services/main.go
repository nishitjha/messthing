package main

import (
	"context"
	"fmt"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/nishitjha/messthing/services/db"
	"github.com/nishitjha/messthing/services/router"

	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()
	ctx := context.Background()

	pool, err := db.Connect(ctx)
	if err != nil {
		fmt.Println("Error connecting to db:", err)
		os.Exit(1)
	}
	defer pool.Close()

	deps := &router.Deps{DB: pool}

	r := router.NewRouter(deps)
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:8081", "http://172.17.35.19:8081"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	fmt.Println("Listening on port 8080...")
	if err := r.Run(":8080"); err != nil {
		fmt.Println("Error starting server:", err)
	}
}
