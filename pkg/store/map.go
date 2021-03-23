package store

import (
	"context"
	"log"
	"sync"
	"time"
)

type record struct {
	value interface{}
	last  int64
}

type Store struct {
	records map[string]*record
	mux     sync.Mutex
	max     int64
}

// New creates a store for time to live records.
// `ctx` controls livecycle.
// `size` is the initial size of the store.
// `ttl` is time to live.
// GC period is 5 seconds.
func New(ctx context.Context, size int, ttl time.Duration) *Store {
	s := &Store{
		records: make(map[string]*record, size),
		max:     int64(ttl.Seconds()),
	}
	ticker := time.NewTicker(5 * time.Second)

	go func() {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			s.gc()
		}
	}()
	return s
}

func (s *Store) gc() {
	s.mux.Lock()
	defer s.mux.Unlock()
	now := time.Now().Unix()
	for k, v := range s.records {
		if now-v.last > s.max {
			log.Println("deleting record", k)
			delete(s.records, k)
		}
	}
}

func (s *Store) Keys() []string {
	keys := make([]string, 0)
	for k := range s.records {
		keys = append(keys, k)
	}
	return keys
}

func (s *Store) Set(k string, v interface{}) {
	s.mux.Lock()
	defer s.mux.Unlock()

	r, ok := s.records[k]
	if !ok {
		r = &record{value: v}
		s.records[k] = r
	} else {
		r.value = v
	}

	r.last = time.Now().Unix()
}

func (s *Store) Get(k string) interface{} {
	s.mux.Lock()
	defer s.mux.Unlock()

	if it, ok := s.records[k]; ok {
		it.last = time.Now().Unix()
		return it.value
	}

	return nil
}

func (s *Store) Update(k string, fn func(value interface{}, found bool) interface{}) {
	s.mux.Lock()
	defer s.mux.Unlock()

	r, found := s.records[k]
	var v interface{}

	if found {
		v = r.value
	}

	// invoke callback.
	v = fn(v, found)

	if !found {
		r = &record{}
		s.records[k] = r
	}

	r.value = v
	r.last = time.Now().Unix()
}
