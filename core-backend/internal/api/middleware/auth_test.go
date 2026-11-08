package middleware

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"

	"core-backend/internal/db"
)

func TestAuthenticateAcceptsValidTokenAndExposesClaims(t *testing.T) {
	middleware := NewAuthMiddleware("middleware-test-secret")
	user := &db.User{ID: uuid.New(), Email: "admin@example.com", Role: db.RoleAdmin}
	sessionID := uuid.New()
	token, err := middleware.GenerateToken(user, sessionID, time.Minute)
	if err != nil {
		t.Fatalf("GenerateToken returned error: %v", err)
	}

	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		claims, err := GetUserClaims(r.Context())
		if err != nil {
			t.Errorf("GetUserClaims returned error: %v", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		if claims.UserID != user.ID || claims.SessionID != sessionID || claims.Role != db.RoleAdmin {
			t.Errorf("unexpected claims: %+v", claims)
		}
		w.WriteHeader(http.StatusNoContent)
	})
	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodGet, "/", nil)
	request.Header.Set("Authorization", "Bearer "+token)
	middleware.Authenticate(next).ServeHTTP(recorder, request)
	if recorder.Code != http.StatusNoContent {
		t.Errorf("status = %d, want %d", recorder.Code, http.StatusNoContent)
	}
}

func TestAuthenticateRejectsMissingMalformedExpiredAndWrongSignatureTokens(t *testing.T) {
	authMiddleware := NewAuthMiddleware("correct-secret")
	expired, err := authMiddleware.GenerateToken(&db.User{ID: uuid.New(), Role: db.RoleBuyer}, uuid.New(), -time.Minute)
	if err != nil {
		t.Fatalf("GenerateToken returned error: %v", err)
	}
	wrongSignature, err := NewAuthMiddleware("wrong-secret").GenerateToken(
		&db.User{ID: uuid.New(), Role: db.RoleBuyer}, uuid.New(), time.Minute,
	)
	if err != nil {
		t.Fatalf("GenerateToken returned error: %v", err)
	}

	for _, test := range []struct {
		name   string
		header string
	}{
		{name: "missing"},
		{name: "malformed scheme", header: "Token abc"},
		{name: "malformed token", header: "Bearer not-a-jwt"},
		{name: "expired", header: "Bearer " + expired},
		{name: "wrong signature", header: "Bearer " + wrongSignature},
	} {
		t.Run(test.name, func(t *testing.T) {
			recorder := httptest.NewRecorder()
			request := httptest.NewRequest(http.MethodGet, "/", nil)
			if test.header != "" {
				request.Header.Set("Authorization", test.header)
			}
			authMiddleware.Authenticate(http.HandlerFunc(func(http.ResponseWriter, *http.Request) {
				t.Fatal("authentication middleware called next for invalid credentials")
			})).ServeHTTP(recorder, request)
			if recorder.Code != http.StatusUnauthorized {
				t.Errorf("status = %d, want %d", recorder.Code, http.StatusUnauthorized)
			}
		})
	}
}

func TestRequireRoleEnforcesRoleAndRequiresClaims(t *testing.T) {
	next := http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	})
	requireAdmin := RequireRole(db.RoleAdmin)(next)

	t.Run("no claims", func(t *testing.T) {
		recorder := httptest.NewRecorder()
		requireAdmin.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/", nil))
		if recorder.Code != http.StatusUnauthorized {
			t.Errorf("status = %d, want %d", recorder.Code, http.StatusUnauthorized)
		}
	})

	t.Run("wrong role", func(t *testing.T) {
		recorder := httptest.NewRecorder()
		request := httptest.NewRequest(http.MethodGet, "/", nil)
		request = request.WithContext(
			contextWithClaims(request, &CustomClaims{Role: db.RoleBuyer}),
		)
		requireAdmin.ServeHTTP(recorder, request)
		if recorder.Code != http.StatusForbidden {
			t.Errorf("status = %d, want %d", recorder.Code, http.StatusForbidden)
		}
	})

	t.Run("allowed role", func(t *testing.T) {
		recorder := httptest.NewRecorder()
		request := httptest.NewRequest(http.MethodGet, "/", nil)
		request = request.WithContext(
			contextWithClaims(request, &CustomClaims{Role: db.RoleAdmin}),
		)
		requireAdmin.ServeHTTP(recorder, request)
		if recorder.Code != http.StatusNoContent {
			t.Errorf("status = %d, want %d", recorder.Code, http.StatusNoContent)
		}
	})
}

func contextWithClaims(request *http.Request, claims *CustomClaims) context.Context {
	return context.WithValue(request.Context(), UserClaimsKey, claims)
}

func TestAuthenticateRejectsNonHMACSigningAlgorithm(t *testing.T) {
	claims := CustomClaims{
		UserID: uuid.New(),
		Role:   db.RoleAdmin,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Minute)),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodNone, claims)
	tokenString, err := token.SignedString(jwt.UnsafeAllowNoneSignatureType)
	if err != nil {
		t.Fatalf("sign none-algorithm token: %v", err)
	}

	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodGet, "/", nil)
	request.Header.Set("Authorization", "Bearer "+tokenString)
	NewAuthMiddleware("test-secret").Authenticate(http.HandlerFunc(func(http.ResponseWriter, *http.Request) {
		t.Fatal("authentication middleware accepted none algorithm")
	})).ServeHTTP(recorder, request)
	if recorder.Code != http.StatusUnauthorized || strings.TrimSpace(recorder.Body.String()) == "" {
		t.Errorf("invalid token response status=%d body=%q", recorder.Code, recorder.Body.String())
	}
}
