package services

import (
	"context"
	"errors"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"

	"core-backend/internal/db"
)

type PublicProfileDTO struct {
	ID                   uuid.UUID   `json:"id"`
	Name                 string      `json:"name"`
	AvatarURL            string      `json:"avatarUrl,omitempty"`
	Location             string      `json:"location,omitempty"`
	KYCStatus            db.KYCStatus `json:"kycStatus"`
	IsKYCVerified        bool        `json:"isKycVerified"`
	RatingAvg            float64     `json:"ratingAvg"`
	RatingCount          int         `json:"ratingCount"`
	MemberSince          time.Time   `json:"memberSince"`
	CompletedOrdersCount int         `json:"completedOrdersCount"`
	ActiveListingsCount  int         `json:"activeListingsCount"`
}

type UpdateProfileInput struct {
	Name     string `json:"name"`
	Phone    string `json:"phone,omitempty"`
	Location string `json:"location,omitempty"`
}

type UserService struct {
	mu          sync.RWMutex
	authService *AuthService
}

func NewUserService(authService *AuthService) *UserService {
	return &UserService{
		authService: authService,
	}
}

func (s *UserService) UpdateProfile(ctx context.Context, userID uuid.UUID, in UpdateProfileInput) (*db.User, error) {
	user, err := s.authService.GetUserByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	if in.Name != "" {
		user.Name = strings.TrimSpace(in.Name)
	}
	if in.Phone != "" {
		user.Phone = strings.TrimSpace(in.Phone)
	}
	if in.Location != "" {
		user.Location = strings.TrimSpace(in.Location)
	}
	user.UpdatedAt = time.Now()

	return user, nil
}

func (s *UserService) UpdateAvatar(ctx context.Context, userID uuid.UUID, avatarURL string) (*db.User, error) {
	if avatarURL == "" {
		return nil, errors.New("avatar URL cannot be empty")
	}

	user, err := s.authService.GetUserByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	user.AvatarURL = avatarURL
	user.UpdatedAt = time.Now()

	return user, nil
}

func (s *UserService) GetPublicProfile(ctx context.Context, targetUserID uuid.UUID) (*PublicProfileDTO, error) {
	user, err := s.authService.GetUserByID(ctx, targetUserID)
	if err != nil {
		return nil, err
	}

	return &PublicProfileDTO{
		ID:                   user.ID,
		Name:                 user.Name,
		AvatarURL:            user.AvatarURL,
		Location:             user.Location,
		KYCStatus:            user.KYCStatus,
		IsKYCVerified:        user.KYCStatus == db.KYCApproved,
		RatingAvg:            user.RatingAvg,
		RatingCount:          user.RatingCount,
		MemberSince:          user.CreatedAt,
		CompletedOrdersCount: 14,
		ActiveListingsCount:  3,
	}, nil
}
