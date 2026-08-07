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
		users.POST("/", func(context *gin.Context) {
			fmt.Printf("Creating user: %v\n", context.Request.Body)
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
