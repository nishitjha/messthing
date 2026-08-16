package router

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/nishitjha/messthing/services/middleware"
)

type Deps struct {
	DB *pgxpool.Pool
}

var dayOrder = []string{"Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"}
var mealTypes = []string{"breakfast", "lunch", "dinner"}

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
			if err != nil {
				context.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch menu", "success": false})
				fmt.Printf("failed to fetch menu: %v\n", err)
				return
			}
			defer rows.Close()

			menu, err := pgx.CollectRows(rows, pgx.RowToMap)
			if err != nil {
				context.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch menu", "success": false})
				fmt.Printf("failed to fetch menu: %v\n", err)
				return
			}

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

			user.GET("/eat/:mealID", func(context *gin.Context) {
				userID := context.Param("userID")
				mealID := context.Param("mealID")

				if mealID == "" {
					context.JSON(http.StatusBadRequest, gin.H{"error": "mealID is required", "success": false})
					return
				}

				_, err := deps.DB.Exec(context.Request.Context(),
					`UPDATE users SET eaten = array_append(eaten, $1) WHERE id = $2`,
					mealID, userID,
				)

				if err != nil {
					fmt.Printf("failed to update user: %v\n", err)
					context.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update user", "success": false})
					return
				}

				context.JSON(http.StatusOK, gin.H{"message": "updated", "success": true})
			})

			user.GET("/week", func(context *gin.Context) {
				userID := context.Param("userID")

				row := deps.DB.QueryRow(context.Request.Context(), "SELECT eaten FROM users WHERE id=$1", userID)
				var eaten []string
				if err := row.Scan(&eaten); err != nil {
					if err == pgx.ErrNoRows {
						context.JSON(http.StatusNotFound, gin.H{"error": "user not found", "success": false})
					} else {
						fmt.Printf("failed to fetch user: %v\n", err)
						context.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch user", "success": false})
					}
					return
				}

				weekday := int(time.Now().Weekday())
				todayIndex := weekday - 1
				if weekday == 0 {
					todayIndex = 6
				}

				neededDays := dayOrder[:todayIndex+1]

				rows, err := deps.DB.Query(context.Request.Context(),
					"SELECT day, date, breakfast, lunch, dinner, id FROM menu WHERE day = ANY($1)", neededDays)
				if err != nil {
					fmt.Printf("failed to fetch menu: %v\n", err)
					context.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch menu", "success": false})
					return
				}
				defer rows.Close()

				type dayMenu struct {
					Day       string
					Date      string
					Breakfast []byte
					Lunch     []byte
					Dinner    []byte
					ID        []string
				}

				byDay := map[string]dayMenu{}
				for rows.Next() {
					var m dayMenu
					if err := rows.Scan(&m.Day, &m.Date, &m.Breakfast, &m.Lunch, &m.Dinner, &m.ID); err != nil {
						fmt.Printf("failed to scan menu row: %v\n", err)
						context.JSON(http.StatusInternalServerError, gin.H{"error": "failed to scan menu", "success": false})
						return
					}
					byDay[m.Day] = m
				}

				eatenSet := map[string]bool{}
				for _, id := range eaten {
					eatenSet[id] = true
				}

				week := []gin.H{}
				for _, day := range neededDays {
					m, ok := byDay[day]
					if !ok {
						continue
					}

					var breakfast, lunch, dinner []string
					json.Unmarshal(m.Breakfast, &breakfast)
					json.Unmarshal(m.Lunch, &lunch)
					json.Unmarshal(m.Dinner, &dinner)

					items := [][]string{breakfast, lunch, dinner}

					for i, mealType := range mealTypes {
						if i >= len(m.ID) {
							continue
						}
						mealID := m.ID[i]
						status := "skipped"
						if eatenSet[mealID] {
							status = "logged"
						}

						week = append(week, gin.H{
							"id":       mealID,
							"day":      m.Day,
							"date":     m.Date,
							"mealType": mealType,
							"status":   status,
							"items":    items[i],
						})
					}
				}

				context.JSON(http.StatusOK, gin.H{"message": "week fetched", "success": true, "week": week})
			})
		}
	}

	return router
}
