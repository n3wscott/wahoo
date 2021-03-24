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

	var key *KeyData
	for _, sk := range c.store.Keys() {
		k := sk.(KeyData)
		if k.ID == id {
			key = &k
			break
		}
	}

	if key != nil {
		if err := out.Encode(c.store.Get(*key)); err != nil {
			fmt.Println(err)
		}
	} else {
		w.WriteHeader(http.StatusNotFound)
	}
}
