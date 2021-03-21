package controller

import (
	"context"
	"github.com/n3wscott/wahoo/pkg/store"
	"golang.org/x/net/websocket"
	"net/http"
	"sync"
	"time"
)

type Controller struct {
	rootHandler http.Handler
	root        string
	mux         *http.ServeMux
	once        sync.Once

	store *store.Store
}

func New(root string) *Controller {
	return &Controller{
		root:  root,
		store: store.New(context.Background(), 10, time.Minute*60),
	}
}

func (c *Controller) Mux() *http.ServeMux {
	c.once.Do(func() {
		m := http.NewServeMux()
		m.HandleFunc("/ui", c.RootHandler)
		m.Handle("/ws", websocket.Handler(c.WSHandler))
		m.HandleFunc("/runs", c.RunsHandler)
		m.HandleFunc("/run/", c.RunHandler)
		c.mux = m
	})

	return c.mux
}
