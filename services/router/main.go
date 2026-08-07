package router

import (
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/nishitjha/messthing/services/middleware"
)

type Deps struct {
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
			jsonBody, _ := context.Get("jsonBody")
			fmt.Printf("Creating user: %v\n", jsonBody)
			context.JSON(201, gin.H{"message": "created", "success": true})

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
