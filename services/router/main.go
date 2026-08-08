package router

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/nishitjha/messthing/services/middleware"
)

type Deps struct {
	DB *pgxpool.Pool
}

func NewRouter(deps *Deps) *gin.Engine {
	gin.SetMode(gin.ReleaseMode)
	router := gin.New()
	router.Use(gin.Recovery())

	router.GET("/", func(context *gin.Context) {
		context.JSON(200, gin.H{"message": "yo", "success": true})
	})

	users := router.Group("/users")
	{
		users.POST("/", middleware.ParseJSON(), func(context *gin.Context) {
			jsonBodyRaw, _ := context.Get("jsonBody")
			jsonBody, ok := jsonBodyRaw.(map[string]interface{})
			if !ok {
				context.JSON(http.StatusBadRequest, gin.H{"error": "invalid body", "success": false})
				return
			}

			id, _ := jsonBody["id"].(string)
			email, _ := jsonBody["email"].(string)
			name, _ := jsonBody["name"].(string)

			if id == "" || email == "" {
				context.JSON(http.StatusBadRequest, gin.H{"error": "id and email are required", "success": false})
				return
			}

			_, err := deps.DB.Exec(context.Request.Context(),
				`INSERT INTO users (id, email, name) VALUES ($1, $2, $3)
				 ON CONFLICT (id) DO NOTHING`,
				id, email, name,
			)
			if err != nil {
				fmt.Printf("failed to create user: %v\n", err)
				context.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create user", "success": false})
				return
			}

			context.JSON(http.StatusCreated, gin.H{"message": "created", "success": true})
		})

		user := users.Group("/:userID")
		user.Use(middleware.AuthMiddleware())
		{
			user.GET("/", func(context *gin.Context) {
				context.JSON(200, gin.H{"userID": context.Param("userID"), "success": true})
			})
		}
	}

	return router
}
