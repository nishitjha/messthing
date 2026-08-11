package router

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
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

	api := router.Group("/api")
	{
		api.GET("/menu", func(context *gin.Context) {
			rows, err := deps.DB.Query(context.Request.Context(), "SELECT day, date, breakfast, lunch, dinner, id FROM menu")

			menu, err := pgx.CollectRows(rows, pgx.RowToMap)

			if err != nil {
				context.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch menu", "success": false})
				fmt.Printf("failed to fetch menu: %v\n", err)
				return
			}

			defer rows.Close()
			context.JSON(http.StatusOK, gin.H{"message": "menu fetched", "success": true, "menu": menu})
		})
	}
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
			var eaten []string

			if id == "" || email == "" {
				context.JSON(http.StatusBadRequest, gin.H{"error": "id and email are required", "success": false})
				return
			}

			_, err := deps.DB.Exec(context.Request.Context(),
				`INSERT INTO users (id, email, name, eaten) VALUES ($1, $2, $3, $4)
				 ON CONFLICT (id) DO NOTHING`,
				id, email, name, eaten,
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
				userID := context.Param("userID")
				row := deps.DB.QueryRow(context.Request.Context(), "SELECT id, email, name, eaten FROM users WHERE id=$1", userID)

				var id, email, name string
				var eaten []string

				err := row.Scan(&id, &email, &name, &eaten)
				if err != nil {
					if err == pgx.ErrNoRows {
						context.JSON(http.StatusNotFound, gin.H{"error": "user not found", "success": false})
					} else {
						fmt.Printf("failed to fetch user: %v\n", err)
						context.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch user", "success": false})
					}
					return
				}

				context.JSON(http.StatusOK, gin.H{
					"message": "user fetched",
					"success": true,
					"user": gin.H{
						"id":    id,
						"email": email,
						"name":  name,
						"eaten": eaten,
					},
				})
			})
		}
	}

	return router
}
