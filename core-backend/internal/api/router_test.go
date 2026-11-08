package api

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"core-backend/internal/api/middleware"
)

func testRouter() *Router {
	return NewRouter(nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, middleware.NewAuthMiddleware("test-secret"), nil)
}

func TestRouterHealthRoutesReportServiceStatus(t *testing.T) {
	t.Setenv("PAYSTACK_SECRET_KEY", "sk_test_router_test")
	router := testRouter()

	for _, test := range []struct {
		name string
		path string
	}{
		{name: "root", path: "/"},
		{name: "health", path: "/health"},
		{name: "api health", path: "/api/health"},
	} {
		t.Run(test.name, func(t *testing.T) {
			recorder := httptest.NewRecorder()
			request := httptest.NewRequest(http.MethodGet, test.path, nil)
			router.ServeHTTP(recorder, request)
			if recorder.Code != http.StatusOK {
				t.Fatalf("status = %d, want %d", recorder.Code, http.StatusOK)
			}

			var response struct {
				Data struct {
					Status   string `json:"status"`
					Service  string `json:"service"`
					Paystack struct {
						Mode       string `json:"mode"`
						Configured bool   `json:"configured"`
					} `json:"paystack"`
				} `json:"data"`
			}
			if err := json.Unmarshal(recorder.Body.Bytes(), &response); err != nil {
				t.Fatalf("decode health response: %v", err)
			}
			if response.Data.Status != "healthy" || response.Data.Service != "scrowpoint-core-backend" {
				t.Errorf("unexpected health payload: %+v", response.Data)
			}
			if response.Data.Paystack.Mode != "test" || !response.Data.Paystack.Configured {
				t.Errorf("unexpected Paystack status: %+v", response.Data.Paystack)
			}
		})
	}
}

func TestRouterConfigAndOptions(t *testing.T) {
	t.Setenv("CORS_ALLOWED_ORIGIN", "")
	t.Setenv("ALLOWED_ORIGINS", "")
	router := testRouter()

	configRecorder := httptest.NewRecorder()
	router.ServeHTTP(configRecorder, httptest.NewRequest(http.MethodGet, "/api/config", nil))
	if configRecorder.Code != http.StatusOK {
		t.Fatalf("config status = %d, want %d", configRecorder.Code, http.StatusOK)
	}
	var configResponse struct {
		Data struct {
			PlatformFeePct float64  `json:"platformFeePct"`
			Categories     []string `json:"categories"`
		} `json:"data"`
	}
	if err := json.Unmarshal(configRecorder.Body.Bytes(), &configResponse); err != nil {
		t.Fatalf("decode config response: %v", err)
	}
	if configResponse.Data.PlatformFeePct != 2.5 || len(configResponse.Data.Categories) == 0 {
		t.Errorf("unexpected public config: %+v", configResponse.Data)
	}

	optionsRecorder := httptest.NewRecorder()
	optionsRequest := httptest.NewRequest(http.MethodOptions, "/api/anything", nil)
	optionsRequest.Header.Set("Origin", "https://frontend.example")
	router.ServeHTTP(optionsRecorder, optionsRequest)
	if optionsRecorder.Code != http.StatusNoContent {
		t.Errorf("OPTIONS status = %d, want %d", optionsRecorder.Code, http.StatusNoContent)
	}
	if got := optionsRecorder.Header().Get("Access-Control-Allow-Origin"); got != "https://frontend.example" {
		t.Errorf("allow-origin = %q, want request origin", got)
	}
	if got := optionsRecorder.Header().Get("X-Content-Type-Options"); got != "nosniff" {
		t.Errorf("X-Content-Type-Options = %q, want nosniff", got)
	}
}
