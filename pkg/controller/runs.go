package controller

import (
	"encoding/json"
	"fmt"
	"net/http"
	"path/filepath"
)

func (c *Controller) RunsHandler(w http.ResponseWriter, r *http.Request) {
	out := json.NewEncoder(w)
	if err := out.Encode(c.store.Keys()); err != nil {
		fmt.Println(err)
	}
}

func (c *Controller) RunHandler(w http.ResponseWriter, r *http.Request) {
	_, id := filepath.Split(r.URL.Path)
	out := json.NewEncoder(w)

	if err := out.Encode(c.store.Get(id)); err != nil {
		fmt.Println(err)
	}
}
