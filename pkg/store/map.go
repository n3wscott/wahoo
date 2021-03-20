package store

import (
	"context"
	"errors"
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
			delete(s.records, k)
		}
	}
}

func (s *Store) Set(k string, v interface{}) {
	s.mux.Lock()
	defer s.mux.Unlock()

	r, ok := s.records[k]
	if !ok {
		r = &record{value: v}
		s.records[k] = r
	}
	r.last = time.Now().Unix()
}

func (s *Store) Get(k string) (interface{}, error) {
	s.mux.Lock()
	defer s.mux.Unlock()

	if it, ok := s.records[k]; ok {
		it.last = time.Now().Unix()
		return it.value, nil
	}

	return nil, errors.New("not found")
}