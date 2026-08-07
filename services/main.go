package main

import (
	"fmt"

	"github.com/nishitjha/messthing/services/router"
)

func main() {
	deps := &router.Deps{}

	router := router.NewRouter(deps)

	fmt.Println("Listening on port 8080...")
	if err := router.Run(":8080"); err != nil {
		fmt.Println("Error starting server:", err)
	}
}
