package handlers

import (
	"encoding/json"
	"net/http"
)

type StandardResponse struct {
	Data  interface{} `json:"data"`
	Error *string     `json:"error"`
}

type PaginatedData struct {
	Items interface{} `json:"items"`
	Total int         `json:"total"`
	Page  int         `json:"page"`
	Limit int         `json:"limit"`
}

func JSONSuccess(w http.ResponseWriter, statusCode int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	_ = json.NewEncoder(w).Encode(StandardResponse{
		Data:  data,
		Error: nil,
	})
}

func JSONError(w http.ResponseWriter, statusCode int, errMsg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	_ = json.NewEncoder(w).Encode(StandardResponse{
		Data:  nil,
		Error: &errMsg,
	})
}
