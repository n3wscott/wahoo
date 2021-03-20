package controller

import (
	"golang.org/x/net/websocket"
	"net/http"
	"sync"
)

type Controller struct {
	rootHandler http.Handler
	root string
	mux  *http.ServeMux
	once sync.Once
}

func New(root string) *Controller {
	return &Controller{root: root}
}

func (c *Controller) Mux() *http.ServeMux {
	c.once.Do(func() {
		m := http.NewServeMux()
		m.HandleFunc("/ui", c.RootHandler)
		m.Handle("/ws", websocket.Handler(c.WSHandler))
		c.mux = m
	})

	return c.mux
}
