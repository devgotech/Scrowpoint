package middleware

import (
	"context"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"

	"core-backend/internal/api/handlers"
	"core-backend/internal/db"
)

type contextKey string

const (
	UserClaimsKey contextKey = "user_claims"
)

type CustomClaims struct {
	UserID    uuid.UUID   `json:"userId"`
	Email     string      `json:"email"`
	Role      db.UserRole `json:"role"`
	SessionID uuid.UUID   `json:"sessionId"`
	jwt.RegisteredClaims
}

type AuthMiddleware struct {
	jwtSecret []byte
}

func NewAuthMiddleware(secret string) *AuthMiddleware {
	return &AuthMiddleware{
		jwtSecret: []byte(secret),
	}
}

func (m *AuthMiddleware) GenerateToken(user *db.User, sessionID uuid.UUID, ttl time.Duration) (string, error) {
	claims := CustomClaims{
		UserID:    user.ID,
		Email:     user.Email,
		Role:      user.Role,
		SessionID: sessionID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(ttl)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "scrowpoint-escrow",
			Subject:   user.ID.String(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(m.jwtSecret)
}

func (m *AuthMiddleware) Authenticate(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			handlers.JSONError(w, http.StatusUnauthorized, "Missing Authorization header")
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			handlers.JSONError(w, http.StatusUnauthorized, "Invalid Authorization header format. Expected Bearer <token>")
			return
		}

		tokenStr := parts[1]
		claims := &CustomClaims{}

		token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, errors.New("unexpected signing method")
			}
			return m.jwtSecret, nil
		})

		if err != nil || !token.Valid {
			handlers.JSONError(w, http.StatusUnauthorized, "Invalid or expired token")
			return
		}

		ctx := context.WithValue(r.Context(), UserClaimsKey, claims)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func RequireRole(roles ...db.UserRole) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			claims, ok := r.Context().Value(UserClaimsKey).(*CustomClaims)
			if !ok || claims == nil {
				handlers.JSONError(w, http.StatusUnauthorized, "Unauthorized: authentication required")
				return
			}

			allowed := false
			for _, role := range roles {
				if claims.Role == role {
					allowed = true
					break
				}
			}

			if !allowed {
				handlers.JSONError(w, http.StatusForbidden, "Forbidden: insufficient permissions")
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

func GetUserClaims(ctx context.Context) (*CustomClaims, error) {
	claims, ok := ctx.Value(UserClaimsKey).(*CustomClaims)
	if !ok || claims == nil {
		return nil, errors.New("no user claims present in context")
	}
	return claims, nil
}
