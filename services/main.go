package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/clerk/clerk-sdk-go/v2"
	"github.com/nishitjha/messthing/services/db"
	"github.com/nishitjha/messthing/services/router"
	"github.com/rs/cors"

	"github.com/joho/godotenv"
)

func main() {

	godotenv.Load()

	clerkKey := os.Getenv("CLERK_SECRET_KEY")
	if clerkKey == "" {
		log.Fatal("CLERK_SECRET_KEY is empty")
	}
	clerk.SetKey(clerkKey)

	ctx := context.Background()

	pool, err := db.Connect(ctx)
	if err != nil {
		fmt.Println("Error connecting to db:", err)
		os.Exit(1)
	}
	defer pool.Close()

	deps := &router.Deps{DB: pool}

	r := router.NewRouter(deps)

	handler := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:8081", "http://172.17.35.19:8081"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}).Handler(r)

	fmt.Println("Listening on port " + os.Getenv("PORT") + "...")
	if err := http.ListenAndServe(":"+os.Getenv("PORT"), handler); err != nil {
		fmt.Println("Error starting server:", err)
	}
}
